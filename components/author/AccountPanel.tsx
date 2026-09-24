"use client";

import { KeyRound, LogOut } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Rotate the studio password from inside the dashboard. The server stores
// the new value hashed in .studio/auth.json through the content store — a
// local file in dev, a GitHub commit on Vercel — and it overrides the
// STUDIO_PASSWORD default from then on. Session cookies are keyed to the
// env secret, so nobody (including the author) gets signed out.
export function AccountPanel() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function toggle() {
    setOpen((value) => !value);
    setError(null);
    setDone(false);
  }

  function cancel() {
    setOpen(false);
    setError(null);
    setCurrent("");
    setNext("");
    setConfirm("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    // Mirror the server rules so the usual mistakes never leave the page.
    if (next.length < 8) {
      setError("The new password needs at least 8 characters");
      return;
    }
    if (next !== confirm) {
      setError("The new passwords don't match");
      return;
    }

    setBusy(true);
    try {
      const body = new URLSearchParams({
        intent: "change-password",
        currentPassword: current,
        newPassword: next,
      });
      const response = await fetch("/api/studio-auth", {
        method: "POST",
        body,
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Could not change the password");
        return;
      }
      setCurrent("");
      setNext("");
      setConfirm("");
      setOpen(false);
      setDone(true);
    } catch {
      setError("Could not reach /api/studio-auth");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5 border-neutral-300 border-t pt-2 dark:border-neutral-800">
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-neutral-600 dark:text-neutral-400"
        onClick={toggle}
        aria-expanded={open}
      >
        <KeyRound />
        {open ? "Cancel" : "Change password"}
      </Button>

      {done && !open && (
        <p className="px-2 text-emerald-600 text-xs dark:text-emerald-400">
          Password updated.
        </p>
      )}

      {open && (
        <form onSubmit={submit} className="flex flex-col gap-1.5 px-1 pb-1">
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="Current password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="New password (8+ characters)"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
          />
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex gap-1.5">
            <Button
              type="submit"
              size="sm"
              disabled={
                busy || !current || !next || !confirm || next.length < 8
              }
            >
              {busy ? "Saving…" : "Update password"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={cancel}
              disabled={busy}
            >
              Cancel
            </Button>
          </div>

          <p className="text-[11px] text-neutral-500">
            Overrides the default you were given. You stay signed in on this
            device.
          </p>
        </form>
      )}

      {/* Plain form post — signs out without a line of JavaScript, like the
          login page does. Lands back on the login door. */}
      <form method="post" action="/api/studio-auth" className="flex flex-col">
        <input type="hidden" name="intent" value="logout" />
        <input type="hidden" name="next" value="/studio-login" />
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="w-full justify-start text-neutral-600 dark:text-neutral-400"
        >
          <LogOut />
          Log out
        </Button>
      </form>
    </div>
  );
}
