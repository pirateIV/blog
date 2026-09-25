"use client";

import type React from "react";
import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

// Subscribes through /api/subscribe, which appends to
// .studio/subscribers.json via the content store (local files in dev, a
// GitHub commit on Vercel). No third-party newsletter service required.
export default function NewsletterSubscription() {
  const [email, setEmail] = useState("");
  // Honeypot: hidden from humans, bots fill it and get a fake success.
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    if (!value || status === "submitting") return;

    setStatus("submitting");
    setError("");
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, honeypot }),
      });
      if (response.ok) {
        setStatus("success");
        setEmail("");
        return;
      }
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setStatus("error");
      setError(payload?.error ?? "Something went wrong - please try again.");
    } catch {
      setStatus("error");
      setError("Could not reach the server - please try again.");
    }
  }

  return (
    <div
      data-newsletter
      className="bg-background-light px-5 py-10 lg:px-15 lg:py-12.5"
    >
      <div className="mx-auto max-w-305">
        <div className="mx-auto flex flex-1 flex-col items-center gap-10 text-center">
          <div className="lg:w-[35%]">
            <p className="font-medium text-accent-orange text-sm">
              Join My Newsletter
            </p>
            <h3 className="font-medium font-playfair-display text-[28px]/[1.2em]">
              Get the best blog stories into your inbox!
            </h3>
          </div>

          {status === "success" ? (
            <p role="status" className="font-medium font-montserrat text-sm">
              You're on the list - thank you for subscribing!
            </p>
          ) : (
            <form
              action="/api/subscribe"
              method="post"
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-2.5 md:w-1/2"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@email.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (status === "error") setStatus("idle");
                }}
                aria-invalid={status === "error" || undefined}
                className="rounded-lg bg-[#ebebeb] p-3.75 text-sm outline-none focus:ring-2 focus:ring-background-dark/30"
              />
              {/* Honeypot — keep it out of the layout, bots still see it. */}
              <input
                type="text"
                name="honeypot"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />
              <button
                type="submit"
                disabled={status === "submitting"}
                className="cursor-pointer rounded-lg bg-background-dark p-3.75 font-semibold text-sm text-white disabled:opacity-60"
              >
                {status === "submitting" ? "Subscribing..." : "Subscribe"}
              </button>
              {status === "error" && (
                <p role="alert" className="text-red-600 text-sm">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
