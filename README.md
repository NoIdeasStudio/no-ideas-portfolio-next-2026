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

