# ShadowDev

ShadowDev is a technical portfolio, engineering journal, and lightweight CMS built with Next.js, React, TypeScript, Tailwind CSS, and Supabase.

The site is designed to work as a live CV for interviews: it highlights PHP/Laravel, LMS, CMS, CRM, education chatbot experience, Vue.js/Next.js frontend skill, UI craft, API security, SEO, and performance-aware product decisions.

## Core Routes

| Route | Purpose |
| --- | --- |
| `/` | Portfolio homepage with interview signals, proof paths, and featured notes |
| `/resume` | Recruiter-friendly technical profile |
| `/projects` | Case studies for UX, CMS, API security, SEO, and performance |
| `/blog` | Searchable journal listing |
| `/blog/[slug]` | Article detail, sharing, comments, and related posts |
| `/tags` | Topic discovery |
| `/contact` | Contact form with basic spam protection |
| `/admin/login` | Private admin login |
| `/admin` | Protected dashboard for post management and SEO status |
| `/admin/posts/new` | Create a blog post with content, SEO, and preview panels |
| `/admin/posts/[slug]/edit` | Edit post content, publish state, and SEO metadata |

## CMS Flow

Public readers use cached `GET` routes for posts, categories, tags, comments, and related content. Admin login exchanges `ADMIN_API_KEY` for an HttpOnly session cookie. Admin mutations accept either the session cookie or an admin bearer/key header.

Required environment variables for real publishing:

```env
NEXT_PUBLIC_SITE_URL=https://shadowdev.dev
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_API_KEY=use-a-long-random-secret
ADMIN_SESSION_SECRET=use-another-long-random-secret
DEFAULT_AUTHOR_ID=00000000-0000-0000-0000-000000000001
OPENAI_API_KEY=sk-your-openai-key
OPENAI_TRANSLATION_MODEL=gpt-5
OPENAI_SEO_MODEL=gpt-5
```

The `posts` table includes SEO fields: `seo_title`, `seo_description`, `canonical_url`, and `noindex`. Run the latest `supabase/schema.sql` or add equivalent migrations before using the admin editor against a real database.

The admin post editor supports bilingual publishing. Write a complete Vietnamese or English version, then use AI translation to generate the other language. The translation endpoint runs server-side, requires admin access, sanitizes returned HTML, preserves code/commands/API identifiers, and never exposes `OPENAI_API_KEY` to the browser.

The SEO tab can also call AI for real suggestions: SEO title, meta description, slug, tags, focus keyword, and review notes. The static SEO score remains a local checklist, while the AI suggestion button generates editable metadata from the current draft.

The app includes development-only mock API fallback for public reads, so the UI remains usable when Supabase is not reachable locally. Creating, updating, and deleting posts still require a real Supabase project and admin key.

## Commands

```bash
npm install
npm run dev
npm run lint
npx tsc --noEmit
npm run build
```

## Security And SEO

- Security headers are configured in `next.config.ts`.
- `/admin` is blocked from indexing through route metadata and `robots.ts`.
- `/admin` and post editor routes redirect to `/admin/login` unless the HttpOnly admin session is valid.
- Public post reads hide drafts and future posts unless an admin key is supplied.
- Public comments expose only approved public fields.
- Post payloads are sanitized before insert/update.
- Metadata, sitemap, robots, RSS, canonical URLs, and Open Graph image generation are included.

## Project Structure

```text
src/
  app/          Next.js app routes and API handlers
  components/   UI, layout, article, comment, and homepage components
  hooks/        Client data hooks with mock fallback
  lib/          Site config, metadata, security, Supabase, and payload helpers
  types/        Shared TypeScript interfaces
supabase/
  schema.sql    Database schema starter
```

## Interview Use

Use the site as a walkthrough:

1. Start with `/resume` for skills and positioning.
2. Open `/projects` to show LMS, CMS, CRM, education chatbot, Laravel, Vue, and Next.js product decisions.
3. Open `/admin/login` and `/admin` to explain CMS publishing, login sessions, and protected writes.
4. Open API files under `src/app/api` to discuss security and data boundaries.
5. Open `next.config.ts`, `src/lib/metadata.ts`, and `src/app/sitemap.ts` to discuss SEO and production basics.
