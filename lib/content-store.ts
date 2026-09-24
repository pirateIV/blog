import "server-only";

import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

// Where the studio's *writes* land.
//
//   local       — development (or any host with a writable disk): files go
//                 straight into the working tree, exactly as before.
//   github      — commit through the GitHub Contents API. On an immutable
//                 host (Vercel) the commit reaches `main`, Vercel redeploys,
//                 and the change becomes public ~a minute later. GitHub is
//                 the database here — no server of our own required.
//   unavailable — production with no storage configured. Routes answer 503
//                 with setup instructions instead of a confusing EACCES.
//
// Reads of the *published site* never come from this module — the site
// always reads its own build copy (data/blog.ts). These helpers only exist
// so publishing can ask "does the file already exist" (collision check,
// preserved date, blob sha for updates/deletes).

export type StorageMode = "local" | "github" | "unavailable";

export type FileSnapshot = {
  contents: string;
  /** Blob sha on GitHub; always null for local files. */
  sha: string | null;
};

/** A storage failure carrying the HTTP status the route should answer. */
export class StorageError extends Error {
  readonly status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "StorageError";
    this.status = status;
  }
}

const REPO_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

export function getStorageMode(): StorageMode {
  const override = process.env.STUDIO_STORAGE?.trim().toLowerCase();
  const repo = process.env.GITHUB_REPO?.trim();
  const token = process.env.GITHUB_TOKEN?.trim();

  if (override === "fs" || override === "local") return "local";
  if (override === "github") return repo && token ? "github" : "unavailable";

  // Auto: GitHub when fully configured (setting the env vars in dev is the
  // opt-in test mode), plain files in development, nothing writable in
  // production — Vercel's runtime filesystem is read-only and ephemeral.
  if (repo && token) return REPO_PATTERN.test(repo) ? "github" : "unavailable";
  return process.env.NODE_ENV !== "production" ? "local" : "unavailable";
}

/** Setup hint for the 503 answer — call only when the mode is "unavailable". */
export function unavailableReason(): string {
  const override = process.env.STUDIO_STORAGE?.trim().toLowerCase();
  if (override === "github") {
    return "STUDIO_STORAGE=github, but GITHUB_REPO and GITHUB_TOKEN are not both set (see .env.example)";
  }
  const repo = process.env.GITHUB_REPO?.trim();
  if (repo && !REPO_PATTERN.test(repo)) {
    return `GITHUB_REPO must look like "owner/repo" (got "${repo}")`;
  }
  return "Publishing storage is not configured on this deployment — set GITHUB_REPO and GITHUB_TOKEN (see .env.example)";
}

/**
 * Answers a storage failure: StorageError messages are written for the
 * studio UI (missing config, rejected token, rate limit) and keep their
 * intended status; anything unexpected becomes an opaque 500.
 */
export function storageErrorResponse(
  error: unknown,
  logLabel: string,
): NextResponse {
  if (error instanceof StorageError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }
  console.error(logLabel, error);
  return NextResponse.json(
    { error: "Storage operation failed" },
    { status: 500 },
  );
}

type GitHubConfig = {
  repo: string;
  branch: string;
  token: string;
  apiUrl: string;
};

function gitHubConfig(): GitHubConfig {
  const repo = process.env.GITHUB_REPO?.trim();
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!repo || !token) throw new StorageError(unavailableReason(), 503);

  return {
    repo,
    branch: process.env.GITHUB_BRANCH?.trim() || "main",
    token,
    apiUrl: (
      process.env.GITHUB_API_URL?.trim() || "https://api.github.com"
    ).replace(/\/+$/, ""),
  };
}

// The path is composed from validated pieces upstream (SLUG_PATTERN keys,
// generated upload names), but rejecting traversal here too means a future
// caller can never escape the two directories the studio owns.
function safePath(filePath: string): string {
  const clean = filePath.replace(/^\/+/, "");
  const unsafe =
    !clean ||
    clean
      .split("/")
      .some((segment) => segment === "" || segment === "." || segment === "..");
  if (unsafe) throw new StorageError(`Unsafe storage path: ${filePath}`, 400);
  return clean;
}

function encodePath(filePath: string): string {
  return safePath(filePath).split("/").map(encodeURIComponent).join("/");
}

// --- local (filesystem) -------------------------------------------------

// Statically scoped directories: Turbopack's NFT trace resolves these two
// subtrees only — a bare path.join(process.cwd(), dynamic) would trace the
// entire project into every route bundle.
const CONTENT_DIR = path.join(process.cwd(), "content");
const UPLOADS_DIR = path.join(process.cwd(), "public", "images", "uploads");

function localPath(filePath: string): string {
  const clean = safePath(filePath);
  if (clean.startsWith("content/") && clean.endsWith(".mdx")) {
    return path.join(CONTENT_DIR, clean.slice("content/".length));
  }
  if (clean.startsWith("public/images/uploads/")) {
    return path.join(UPLOADS_DIR, clean.slice("public/images/uploads/".length));
  }
  throw new StorageError(`Unsafe storage path: ${filePath}`, 400);
}

function localRead(filePath: string): FileSnapshot | null {
  try {
    return {
      contents: fs.readFileSync(localPath(filePath), "utf-8"),
      sha: null,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    console.error("[storage] local read failed", error);
    throw new StorageError(`Could not read ${filePath}`, 500);
  }
}

function localWrite(filePath: string, data: string | Buffer): void {
  try {
    const target = localPath(filePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, data);
  } catch (error) {
    console.error("[storage] local write failed", error);
    throw new StorageError(`Could not write ${filePath}`, 500);
  }
}

function localDelete(filePath: string): void {
  try {
    fs.rmSync(localPath(filePath), { force: true });
  } catch (error) {
    console.error("[storage] local delete failed", error);
    throw new StorageError(`Could not delete ${filePath}`, 500);
  }
}

// --- GitHub (Contents API) ----------------------------------------------

type FetchInit = {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
};

async function gitHubFetch(
  config: GitHubConfig,
  urlPath: string,
  init: FetchInit = {},
): Promise<Response> {
  try {
    return await fetch(`${config.apiUrl}${urlPath}`, {
      method: init.method ?? "GET",
      body: init.body,
      cache: "no-store",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${config.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...init.headers,
      },
    });
  } catch (error) {
    console.error("[storage] GitHub unreachable", error);
    throw new StorageError("Could not reach GitHub — try again", 502);
  }
}

// Turns GitHub's status codes into messages the studio can act on.
async function gitHubError(
  response: Response,
  action: string,
): Promise<StorageError> {
  const payload = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;
  const detail = payload?.message ? ` — ${payload.message}` : "";

  if (response.status === 401) {
    return new StorageError(
      `GitHub rejected GITHUB_TOKEN (401) — check the token value${detail}`,
      502,
    );
  }
  if (response.status === 403) {
    if (response.headers.get("x-ratelimit-remaining") === "0") {
      return new StorageError(
        `GitHub rate limit reached — wait a minute and retry${detail}`,
        502,
      );
    }
    return new StorageError(
      `GitHub refused the request (403) — the token needs Contents: read and write on this repo${detail}`,
      502,
    );
  }
  if (response.status === 404) {
    return new StorageError(
      `GitHub returned 404 — check GITHUB_REPO ("owner/repo") and GITHUB_BRANCH${detail}`,
      502,
    );
  }
  return new StorageError(
    `GitHub could not ${action} the file (HTTP ${response.status})${detail}`,
    502,
  );
}

/** File contents at `filePath`, or null when it does not exist. */
async function gitHubRead(
  config: GitHubConfig,
  filePath: string,
): Promise<FileSnapshot | null> {
  const url = `/repos/${config.repo}/contents/${encodePath(filePath)}?ref=${encodeURIComponent(config.branch)}`;
  const response = await gitHubFetch(config, url);

  if (response.status === 404) return null;
  if (!response.ok) throw await gitHubError(response, "read");

  const payload = (await response.json()) as {
    content?: unknown;
    encoding?: unknown;
    sha?: unknown;
  };
  if (payload.encoding !== "base64" || typeof payload.content !== "string") {
    throw new StorageError(
      `GitHub returned ${filePath} in an unreadable format`,
      502,
    );
  }

  return {
    contents: Buffer.from(
      payload.content.replace(/\s+/g, ""),
      "base64",
    ).toString("utf-8"),
    sha: typeof payload.sha === "string" ? payload.sha : null,
  };
}

async function gitHubWrite(
  config: GitHubConfig,
  filePath: string,
  data: string | Buffer,
  message: string,
): Promise<void> {
  const contents = (
    typeof data === "string" ? Buffer.from(data, "utf-8") : data
  ).toString("base64");
  const url = `/repos/${config.repo}/contents/${encodePath(filePath)}`;
  const send = (sha: string | null) =>
    gitHubFetch(config, url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        content: contents,
        branch: config.branch,
        ...(sha ? { sha } : {}),
      }),
    });

  const current = await gitHubRead(config, filePath);
  let response = await send(current?.sha ?? null);

  // The blob changed between our read and the write (another tab, a
  // concurrent rename): refetch the sha and retry exactly once.
  if (response.status === 409 || response.status === 422) {
    const fresh = await gitHubRead(config, filePath);
    response = await send(fresh?.sha ?? null);
    if (response.status === 409 || response.status === 422) {
      throw await gitHubError(response, "save");
    }
  }

  if (!response.ok) throw await gitHubError(response, "save");
  await response.json().catch(() => null); // drain the body
}

async function gitHubDelete(
  config: GitHubConfig,
  filePath: string,
  message: string,
): Promise<void> {
  const current = await gitHubRead(config, filePath);
  if (!current?.sha) return; // already gone — deleting is idempotent

  const url = `/repos/${config.repo}/contents/${encodePath(filePath)}`;
  const response = await gitHubFetch(config, url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      branch: config.branch,
      sha: current.sha,
    }),
  });

  if (!response.ok) throw await gitHubError(response, "delete");
  await response.json().catch(() => null); // drain the body
}

// --- public API (routes only) -------------------------------------------

export async function readFile(filePath: string): Promise<FileSnapshot | null> {
  const mode = getStorageMode();
  if (mode === "github") return gitHubRead(gitHubConfig(), filePath);
  if (mode === "unavailable") throw new StorageError(unavailableReason(), 503);
  return localRead(filePath);
}

export async function writeFile(
  filePath: string,
  data: string | Buffer,
  message: string,
): Promise<void> {
  const mode = getStorageMode();
  if (mode === "github") {
    await gitHubWrite(gitHubConfig(), filePath, data, message);
    return;
  }
  if (mode === "unavailable") throw new StorageError(unavailableReason(), 503);
  localWrite(filePath, data);
}

export async function deleteFile(
  filePath: string,
  message: string,
): Promise<void> {
  const mode = getStorageMode();
  if (mode === "github") {
    await gitHubDelete(gitHubConfig(), filePath, message);
    return;
  }
  if (mode === "unavailable") throw new StorageError(unavailableReason(), 503);
  localDelete(filePath);
}
