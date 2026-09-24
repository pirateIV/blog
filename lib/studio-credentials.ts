import "server-only";

import {
  createHash,
  createHmac,
  randomBytes,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import {
  getStorageMode,
  readFile,
  StorageError,
  writeFile,
} from "@/lib/content-store";
import { getStudioPassword } from "@/lib/studio-auth";

// The author's active studio password.
//
//   default — STUDIO_PASSWORD env: what the site owner hands to the author.
//   changed — a peppered scrypt verifier in .studio/auth.json, written by
//             the studio's "Change password" form through the content store
//             (local file in dev, a GitHub commit on Vercel — login re-reads
//             it on every attempt, so a change applies within seconds).
//
// While the file exists the changed password OVERRIDES the default;
// deleting .studio/auth.json resets back to the default. The env password
// does double duty: it is the pepper (a verifier leaked with the repo is
// useless without it) and the session-cookie secret — so rotating the
// password never signs anyone out, and the edge proxy never needs this
// module (it must stay free of node:crypto).
//
// Only route handlers import this — never proxy.ts.

const CREDENTIALS_PATH = ".studio/auth.json";
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 200; // bounds the scrypt work per attempt
const SALT_BYTES = 16;
// ~16MB of memory per verification — comfortable for a login, painful for
// an offline attacker grinding through a leaked verifier.
const SCRYPT_COST = { N: 16384, r: 8, p: 1 };

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number },
) => Promise<Buffer>;

type StoredCredential = { salt: Buffer; verifier: Buffer };

/**
 * Reads .studio/auth.json through the content store.
 *   null  — no file: the env default is active.
 *   value — that password is active and overrides the default.
 * Throws StorageError when the store itself is unreachable — "can't read"
 * must never be confused with "not set", or a hiccup would silently
 * resurrect the default password.
 */
async function readStored(): Promise<StoredCredential | null> {
  const pepper = getStudioPassword();
  if (!pepper) return null; // without the pepper nothing can be verified

  // No storage configured at all: a changed password can neither exist nor
  // be read on this deployment, so the env default is the only credential —
  // refusing here would lock the login page shut for everyone. This is a
  // deliberate configuration, unlike a read that is *attempted and fails*
  // (GitHub down, rejected token, rate limit): those must still throw and
  // never silently resurrect the default.
  if (getStorageMode() === "unavailable") return null;

  const snapshot = await readFile(CREDENTIALS_PATH);
  if (!snapshot) return null;

  try {
    const parsed = JSON.parse(snapshot.contents) as {
      v?: unknown;
      salt?: unknown;
      verifier?: unknown;
    };
    if (
      parsed.v !== 1 ||
      typeof parsed.salt !== "string" ||
      !/^[0-9a-f]{32}$/.test(parsed.salt) ||
      typeof parsed.verifier !== "string" ||
      !/^[0-9a-f]{64}$/.test(parsed.verifier)
    ) {
      throw new Error("unexpected shape");
    }
    return {
      salt: Buffer.from(parsed.salt, "hex"),
      verifier: Buffer.from(parsed.verifier, "hex"),
    };
  } catch (error) {
    // A corrupt file falls back to the default rather than locking the
    // author out; whoever can corrupt the repo can read it anyway.
    console.error("[studio] ignoring malformed .studio/auth.json", error);
    return null;
  }
}

/** scrypt(password, salt) then HMAC with the env pepper. */
async function deriveVerifier(
  pepper: string,
  password: string,
  salt: Buffer,
): Promise<Buffer> {
  const key = await scryptAsync(
    password.normalize("NFKC"),
    salt,
    32,
    SCRYPT_COST,
  );
  return createHmac("sha256", pepper).update(key).digest();
}

/**
 * Checks a password against the active credential: the stored verifier
 * when one exists, otherwise the STUDIO_PASSWORD default (timing-safe
 * sha256 compare, same as always). Storage failures propagate as
 * StorageError so the caller can tell "wrong password" from "couldn't
 * look it up".
 */
export async function verifyStudioPassword(provided: string): Promise<boolean> {
  const pepper = getStudioPassword();
  if (!pepper || !provided || provided.length > MAX_PASSWORD_LENGTH) {
    return false;
  }

  const stored = await readStored();
  if (stored) {
    const candidate = await deriveVerifier(pepper, provided, stored.salt);
    return (
      candidate.length === stored.verifier.length &&
      timingSafeEqual(candidate, stored.verifier)
    );
  }

  const a = createHash("sha256").update(provided, "utf8").digest();
  const b = createHash("sha256").update(pepper, "utf8").digest();
  return timingSafeEqual(a, b);
}

export type ChangeResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

/**
 * Rotates the studio password. Verifies `current` against the active
 * credential first, then writes the new peppered verifier through the
 * content store. Existing session cookies keep working (they are keyed to
 * the env secret, not to this password).
 */
export async function changeStudioPassword(
  current: string,
  replacement: string,
): Promise<ChangeResult> {
  const pepper = getStudioPassword();
  if (!pepper) {
    return {
      ok: false,
      status: 503,
      error:
        "Changing the password needs STUDIO_PASSWORD configured on the server",
    };
  }
  if (replacement.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      status: 400,
      error: `The new password needs at least ${MIN_PASSWORD_LENGTH} characters`,
    };
  }
  if (replacement.length > MAX_PASSWORD_LENGTH) {
    return {
      ok: false,
      status: 400,
      error: `The new password may be at most ${MAX_PASSWORD_LENGTH} characters`,
    };
  }
  if (replacement === current) {
    return {
      ok: false,
      status: 400,
      error: "The new password must differ from the current one",
    };
  }
  if (!(await verifyStudioPassword(current))) {
    return { ok: false, status: 400, error: "The current password is wrong" };
  }

  const salt = randomBytes(SALT_BYTES);
  const verifier = await deriveVerifier(pepper, replacement, salt);
  const payload = `${JSON.stringify(
    {
      v: 1,
      algo: "scrypt-16384-8-1+sha256hmac-pepper",
      salt: salt.toString("hex"),
      verifier: verifier.toString("hex"),
    },
    null,
    2,
  )}\n`;

  try {
    // GitHub mode commits this file (the repo is the database); local mode
    // writes it next to the draft backup. Never the plaintext.
    await writeFile(CREDENTIALS_PATH, payload, "studio: change password");
  } catch (error) {
    if (error instanceof StorageError) {
      return { ok: false, status: error.status, error: error.message };
    }
    console.error("[studio] could not store the new password", error);
    return {
      ok: false,
      status: 500,
      error: "Could not store the new password",
    };
  }

  return { ok: true };
}
