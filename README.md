# Tajul Islam — Personal Portfolio + CMS

A full-stack personal website: portfolio, blog ("Thoughts"), career/education timeline,
resume center, and a real admin dashboard to manage all of it — no code editing required
after setup.

## ⚠️ Read this first

This code was written but **not run or tested** — the environment that generated it has
no internet access, so `npm install`, database connections, and a dev server were never
actually executed. Treat this as a solid, carefully-written first draft, not a verified
build. Follow the steps below on your own machine; if you hit an error, copy the exact
message back and it can be fixed quickly — Next.js/Prisma errors are almost always small
and specific.

## Tech stack (and why)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14** (App Router, TypeScript) | One project serves both the public site and the admin dashboard/API — no separate backend to host. |
| Database | **PostgreSQL** | Matches what you asked for; works with any host (Supabase, Neon, Railway, your own server). |
| ORM | **Prisma** | Type-safe queries, simple migrations, generates the DB schema from one file. |
| Auth | **NextAuth (Credentials provider) + bcrypt** | Real hashed-password login, session cookie, protects `/admin` and `/api/admin/*`. |
| Styling | **Tailwind CSS** | Fast to theme; used here to rebuild your original glassmorphism/gradient look. |
| Blog content | **Markdown** (`react-markdown`) | Lightweight "rich enough" editor without a heavy WYSIWYG dependency. |
| File uploads | Local `/public/uploads` via a Next.js API route | Works immediately in dev and on any host with persistent disk. **Does not work on Vercel's serverless functions** — see Deployment below. |

This intentionally avoids Next.js + 6 extra services for a one-admin personal site —
Postgres + Prisma + NextAuth is the smallest stack that satisfies "real database, real
auth, real CRUD."

## What was preserved / improved / replaced from your original site

**Preserved (visual identity):** the gradient/glassmorphism look, the four floating
background circles, section-style page rhythm, timeline-style education/experience,
skill badges (not percentage bars, per your instructions), project cards, and a project
detail view descended from your popup. Original content — your name, the 6 education
entries, the 8 EEE skills, all 8 social links — is migrated into the database via the
seed script (`prisma/seed.ts`), so nothing was thrown away.

**Improved:** navigation is no longer a single-page anchor scroll — each section is a
real route (`/about`, `/projects`, etc.), which is better for SEO and for a site that
will keep growing. The "About tabs" (education/experience) became full timeline pages.
Project detail is a real dynamic page instead of a JS-driven popup.

**Replaced/removed:** the duplicated Contact section in your original `index.html` (it
appeared twice, back to back, with two different emails) — this was a bug, not a
feature, so only one clean contact form remains. The `Lorem ipsum` placeholder project
was not migrated (per your instruction not to copy outdated/incorrect content); one
clearly-labeled draft sample project was seeded instead so the admin UI isn't empty on
first login.

## Project structure

```
prisma/
  schema.prisma      # full data model (Profile, Project, BlogPost, Experience, etc.)
  seed.ts             # creates your admin login + migrates original content
src/
  app/
    (public pages)    page.tsx, about/, projects/, experience/, education/,
                       skills/, blog/, resume/, contact/
    admin/            login/, and one folder per CMS section (protected)
    api/
      auth/[...nextauth]/   NextAuth handler
      contact/               public contact form submission
      admin/                 all CRUD endpoints + file upload (protected)
  components/          shared UI (Navbar, Footer, ProjectCard, BlogCard, TimelineItem)
  components/admin/    admin-only UI (forms, image uploader)
  lib/                 prisma client, auth config, slug/date helpers
  middleware.ts        gate for /admin/* and /api/admin/*
public/uploads/         uploaded images/PDFs land here (local dev / self-hosted)
```

## 1. Local setup

```bash
# 1. Install dependencies
npm install

# 2. Copy the env template and fill it in
cp .env.example .env
```

Edit `.env`:
- `DATABASE_URL` / `DIRECT_URL` — from Supabase (Project Settings → Database →
  Connection String). See the comments in `.env.example` for which is which.
- `NEXTAUTH_SECRET` — run `openssl rand -base64 32` and paste the output.
- `NEXTAUTH_URL` — `http://localhost:3000` for local dev.
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — from Supabase (Project Settings → API).
  The service role key is secret — see the warning in `.env.example`.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` — your login for `/admin`. Use a real,
  strong password; this is a real account.

**Create two Storage buckets in Supabase** (Storage → New bucket, in the Supabase
dashboard sidebar) before running the app:
- `portfolio-media` — set **Public** — for images (thumbnails, gallery, profile photo)
- `portfolio-documents` — set **Public** — for PDFs (resume, certificates)

```bash
# 3. Create/update the database tables
npx prisma migrate dev --name upgrade_media_model

# 4. Seed your admin account + migrated original content
npm run seed

# 5. Run it
npm run dev
```

Visit `http://localhost:3000` for the public site and `http://localhost:3000/admin/login`
for the dashboard. Try **Media** in the sidebar — upload an image and confirm it shows up
there and that the URL it returns is a `supabase.co` link, not a local `/uploads/` path.

## 2. Adding your first project

1. Log in at `/admin/login`.
2. Go to **Projects** → you'll see one seeded sample project marked *draft*. Edit or
   delete it.
3. Click **+ Add Project**, fill in title, description, upload a thumbnail, pick a
   category, and set **Status → Published**.
4. It now appears on `/projects` and has its own page at `/projects/your-slug`.

## 3. Publishing your first blog post

1. Go to **Blog / Thoughts** → **+ Write Article**.
2. Write in Markdown (headings with `##`, bold with `**text**`, lists with `-`). Use
   **Preview** to sanity-check.
3. Set **Status → Published** and save. It appears at `/blog/your-slug`.

## 4. Editing your profile

**Profile** in the sidebar covers your name, title, photo, bio, objective, full
biography, location, contact details, and every social link. Changes are live
immediately on `/about` and the homepage.

## 5. Replacing your CV

In **Profile**, use the "Resume / CV" uploader (accepts PDF). The `/resume` page and the
homepage "Download Resume" button always point at whatever is currently uploaded there.

## 6. Deploying

**Recommended: Netlify or Vercel (hosting) + Supabase (Postgres + Storage).**

1. Push this project to a GitHub repo.
2. Import the repo into Netlify or Vercel. Add the same environment variables from
   `.env` in the site's environment variable settings: `DATABASE_URL`, `DIRECT_URL`,
   `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (= your live domain), `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`.
3. Deploy. Then run migrations + seed against the production database once, from your
   own machine:
   ```bash
   DATABASE_URL="your-production-pooled-url" DIRECT_URL="your-production-direct-url" npx prisma migrate deploy
   DATABASE_URL="your-production-pooled-url" npm run seed
   ```

**File uploads now go to Supabase Storage**, not local disk — this works correctly on
Netlify/Vercel's serverless functions (which have no persistent filesystem), so there's
no separate storage swap needed for deployment like there was before.

## 7. Security notes

- Admin password is hashed with bcrypt, never stored or shown in plain text.
- `/admin/*` (except `/admin/login`) and `/api/admin/*` are gated by NextAuth session
  middleware — no session, no access.
- `SUPABASE_SERVICE_ROLE_KEY` is used only inside `src/lib/storage/supabase.ts`, which is
  only ever called from server-side API routes — it's never imported by a `"use client"`
  file and never reaches the browser.
- Secrets (`DATABASE_URL`, `NEXTAUTH_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, admin
  credentials) live only in
  environment variables, never in frontend code.
- Uploads are restricted by MIME type (images + PDF only) and size (10MB max).
- The contact form has a honeypot field and server-side validation (Zod) against spam.
- This is a **single-admin** system by design — there's no user registration flow, which
  is intentionally the smallest attack surface for a personal site.

## 8. CMS upgrade report (Phase 1 of the "full CMS" spec)

You sent a very large follow-up spec (63 parts) to turn this into a full CMS with
Supabase Storage, a Media Library, Homepage CMS, admin redesign, and more. Attempting
all of it in one untested pass was too risky, so this delivers **Phase 1 — storage
infrastructure** only, matching your own priority order. Here's exactly what changed:

**New:**
- `src/lib/storage/` — a provider-agnostic storage abstraction (`types.ts`,
  `supabase.ts`, `index.ts`). Swapping Supabase for S3/Cloudflare R2/Cloudinary later
  means writing one new file here, not touching the rest of the app.
- `Media` model upgraded with `mimeType`, `width`, `height`, `altText`, `title`,
  `provider`, `bucket`, `storagePath`, `externalId`, `folder`, `updatedAt` — all new
  columns are optional, so no existing row is touched or broken.
- `/admin/media` — a real Media Library: grid view, search, type filter, pagination,
  upload, copy URL, edit title/alt text, delete (blocked with a clear warning + "delete
  anyway" override if the file is still referenced by a project/post/profile/etc. —
  PART 49).
- `ImageUploader` now has three tabs — **Upload**, **Media Library** (reuse something
  you already uploaded instead of re-uploading), **External URL**. Every field that used
  it (project thumbnail, blog featured image, profile photo, certificates) gets this for
  free, with no changes needed to those forms.
- `/api/admin/media` (list/search/register) and `/api/admin/media/[id]` (edit/delete).

**Changed:**
- `/api/admin/upload` now uploads to Supabase Storage instead of `/public/uploads` —
  this is the piece that actually needed fixing for serverless hosting (Netlify/Vercel
  have no persistent disk). PART 5/51 of your spec.
- `next.config.js` — image domains now explicitly allow `*.supabase.co`.
- Dashboard overview shows a Media count; sidebar shows a "Media" link and an unread
  message count badge.

**Not touched / deferred to Phase 2:**
- Google Drive tab (Part 12) — Drive's URL formats and access-checking add real
  complexity; flagged rather than rushed.
- Homepage CMS (Part 17-18), admin dashboard visual redesign (Part 14), project
  gallery drag-reorder (Part 20), activity log (Part 56), structured data/JSON-LD
  (Part 31), duplicate content (Part 45), accessibility audit (Part 38) — all real,
  all deferred so Phase 1 could be verified rather than guessed at.

**Migration needed:** the `Media` model changed, so you must run
`npx prisma migrate dev --name upgrade_media_model` locally against your database (see
Local Setup above) before this will work. It's additive-only — no data loss.

Once you've deployed this, tested `/admin/media`, and confirmed uploads land in
Supabase (not a local path), say so and Phase 2 can start.

## 9. Troubleshooting: "There is a problem with the server configuration"

This is NextAuth's generic error page — it hides the real cause. Two things cause it
almost every time:

1. **`NEXTAUTH_SECRET` missing on Netlify**, or you added/changed env vars but never
   triggered a new deploy afterward. Env var changes don't apply retroactively — go to
   **Deploys → Trigger deploy → Deploy site** after any env var change.
2. **Using Supabase's pooled connection string without `?pgbouncer=true`.** Serverless
   functions (Netlify, Vercel) each open a fresh DB connection per request; without this
   flag, Prisma's prepared-statement queries fail against Supabase's pooler, and that
   failure inside the login check surfaces as this generic "Configuration" error. Fix:
   use `DATABASE_URL` = the **pooled** connection string (port 6543) with
   `?pgbouncer=true&connection_limit=1` appended, and set a separate `DIRECT_URL` (port
   5432, no pgbouncer) for running migrations locally — see `.env.example`. Set both in
   Netlify's environment variables too, then redeploy.

To see the *actual* underlying error instead of guessing: Netlify → your site →
**Deploys** → open the latest deploy → **Functions** (or **Function logs**) → click the
function that handles `/api/auth/*` → read the real stack trace there.

