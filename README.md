This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Publishing storage

The author studio (`/studio`) writes posts through `/api/publish`, and the
write backend depends on where the app runs:

- **Development** — no configuration: posts and cover uploads are written
  straight into `content/` and `public/images/uploads/`.
- **Production on an immutable host (Vercel)** — the runtime filesystem is
  read-only, so the same endpoints commit through the **GitHub Contents
  API** instead. Set these in the project's environment variables:

  | Variable | Required | Value |
  | --- | --- | --- |
  | `STUDIO_PASSWORD` | yes | locks the studio behind `/studio-login` |
  | `GITHUB_REPO` | yes | `owner/repo` |
  | `GITHUB_TOKEN` | yes | fine-grained PAT, *Contents: Read and write*, this repo only |
  | `GITHUB_BRANCH` | no | branch to commit to (default `main`) |

  A commit lands on `main`, Vercel redeploys automatically, and the change
  goes live about a minute later — the studio says so when it succeeds.
  Without `GITHUB_REPO`/`GITHUB_TOKEN`, production answers **503** with
  setup instructions on publish/unpublish/upload; public reads are
  unaffected either way.

  Local draft backups (`.studio/drafts.json`) need a writable disk too —
  on Vercel the studio falls back to browser `localStorage`, which is
  where drafts are restored from anyway.

## Studio password

Login accepts the **active** studio password:

1. **Default** — `STUDIO_PASSWORD` from the environment. This is the value
   you hand to your author.
2. **Changed** — once the author uses *Change password* (bottom of the
   studio sidebar at `/studio`), the new value is stored **hashed** in
   `.studio/auth.json` and overrides the default. On Vercel that file is
   committed through the GitHub API like any other studio write, and login
   re-reads it on every attempt — a change takes effect within seconds.

**Secret door:** on any public page, type `studio` (just the letters) and
the browser jumps straight to `/studio`. Inputs are ignored, nothing
appears on screen — knowing the sequence is the whole “key”. It only
routes; the password gate still guards the studio itself.

Details worth knowing:

- The hash is scrypt-salted and peppered with `STUDIO_PASSWORD`, so a
  public repo never exposes anything crackable. **Keep `STUDIO_PASSWORD`
  set** — it also signs session cookies.
- Changing the password does **not** sign anyone out (cookies are keyed to
  the env secret, not to the login value).
- **Reset to the default:** delete `.studio/auth.json` — locally for dev,
  and in the repo for production
  (`gh api -X DELETE repos/<owner>/<repo>/contents/.studio/auth.json`
  with the file's `sha`), then redeploy.
- In dev, running with `GITHUB_*` set opts you into the same shared
  credential store your deployment uses; without those vars, dev password
  changes stay on your machine.

## Discoverability

- `app/sitemap.ts` → `/sitemap.xml` — home, blog, category pages and every
  published post, re-read from `content/` per request.
- `app/robots.ts` → `/robots.txt` — allows the public site, keeps crawlers
  out of the studio and API, points at the sitemap.
- `app/feed.xml/route.ts` → `/feed.xml` — RSS 2.0 of all published posts
  (also advertised via `<link rel="alternate">` in the layout metadata).

All three resolve URLs against `NEXT_PUBLIC_SITE_URL` (falling back to the
template demo origin), the same base as `metadataBase` in `app/layout.tsx`.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
