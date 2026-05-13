# No Ideas — Next.js + Sanity starter

This is a minimal rebuild of the **No Ideas** portfolio currently at [`https://no-ideas.webflow.io`](https://no-ideas.webflow.io), set up for a modern GitHub + Vercel + Sanity workflow.

## Tech stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** for layout/typography
- **Sanity** as the headless CMS (`project` and `siteSettings` documents defined)

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Copy the example environment file and fill in your Sanity details:

```bash
cp .env.local.example .env.local
```

Set:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET` (usually `production`)
- `SANITY_PROJECT_ID`
- `SANITY_DATASET`

3. Run the dev server:

```bash
npm run dev
```

4. (Optional) Start the Sanity Studio locally:

```bash
npx sanity@latest dev
```

> The Sanity config and schemas live in `sanity.config.ts` and `sanity/schemas/*`. You can either embed the Studio in this repo or keep it as a separate Studio project.

## Content workflow: local Studio vs. web editors (how they stay in sync)

**Where content lives:** All content is stored in **Sanity’s cloud** (your project + dataset). There is no separate “sync” step—Studio and the Next.js site both use this same backend.

**You, locally:**

1. **Next.js site:** `npm run dev` → open `http://localhost:3000`. The site fetches content from Sanity using `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` in `.env.local`.
2. **Sanity Studio (two options):**
   - **Inside the app:** With `npm run dev` running, open `http://localhost:3000/studio`. This is the same Studio that will be at `yoursite.com/studio` when deployed. It reads/writes the same Sanity project.
   - **Standalone:** `npm run sanity` runs Studio on a different port (e.g. 3333). Same project/dataset, just a separate dev server.

**Other users (editors) on the web:**

1. **Deploy the app** (e.g. to Vercel) so the site and Studio are both on the internet.
2. **Studio URL:** Editors go to **`https://your-vercel-url.vercel.app/studio`** (or your custom domain + `/studio`).
3. **Log in:** They sign in with Google/GitHub/etc. You must **invite them** to your Sanity project: [manage.sanity.io](https://manage.sanity.io) → your project → **Members** → Invite. Until they’re members, they can’t open Studio.
4. **Edits:** They create/edit content in Studio. Changes are saved directly to Sanity’s cloud (same project/dataset your site uses).

**How the site and Studio stay in sync:**

- **Studio** (local or at `/studio` on Vercel) and the **Next.js site** (local or Vercel) both talk to the **same Sanity project and dataset**. No export/import or manual sync.
- The site uses **ISR** with `revalidate = 60` (see `src/app/page.tsx`). So at most every 60 seconds the homepage (and other pages that use `revalidate`) refetch from Sanity. Edits made in Studio by you or others show up on the live site within that window (or on the next request after the revalidate window).

**Summary:** Build and run locally with `npm run dev`; use `http://localhost:3000/studio` to edit content. Deploy to Vercel so others can use `https://yoursite.com/studio`. Everyone edits the same Sanity project; the site stays in sync by refetching from Sanity (revalidate).

## CMS structure

- `project` — one entry per project on the index:
  - `title`, `slug`, `summary`, `meta`, `externalLabel`, `externalUrl`, `body`
- `siteSettings` — global copy:
  - `title`, `description`, `intro`

The homepage is currently wired to a **static seed list** in `src/app/page.tsx` that mirrors the current Webflow content. Once you have Sanity populated, you can swap this to fetch from Sanity using the client and GROQ queries in `src/lib/sanity.client.ts` and `src/lib/sanity.queries.ts`.

## GitHub + Vercel

1. Initialize a git repo and push to GitHub:

```bash
git init
git add .
git commit -m "Initial No Ideas Next.js + Sanity scaffold"
git branch -M main
git remote add origin git@github.com:your-username/no-ideas-next.git
git push -u origin main
```

2. In Vercel:
   - Import the GitHub repo.
   - **Add environment variables** (required for the build): Project → **Settings** → **Environment Variables**. Add the same vars as in `.env.local`:
     - `NEXT_PUBLIC_SANITY_PROJECT_ID` (your Sanity project ID)
     - `NEXT_PUBLIC_SANITY_DATASET` (e.g. `production`)
     - `SANITY_PROJECT_ID` (same as above)
     - `SANITY_DATASET` (e.g. `production`)
     - Enable them for **Production** (and Preview if you use preview deployments).
   - Deploy.

You will then have a portable, CMS-backed version of the No Ideas site that can grow over time (project detail pages, shop, etc.).

