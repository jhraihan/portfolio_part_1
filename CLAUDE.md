# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

A personal portfolio for Md. Jahid Hasan Raihan: a Django REST API serving a
React single-page app. All content — projects, skills, screenshots, links — is
stored in the database and edited through the Django admin, never hardcoded in
the frontend.

```
backend/     Django 5 + DRF. The API and the admin CMS.
frontend/    React 18 + Vite + Tailwind. Consumes the API.
docs/        PRD and about-the-owner documents (PDF + HTML source).
images/      Full-resolution source photos. Git-ignored.
cv/          CV source. Git-ignored.
```

## Content rules — read before editing any content

This site represents a real person applying for real jobs. Content accuracy is
a hard constraint, not a style preference.

- **Never invent content.** No fabricated projects, metrics, dates, employers,
  testimonials, or achievements. Every value in `seed_portfolio.py` came from
  the site owner.
- **Never claim professional experience.** He is a recent graduate. Do not write
  copy implying jobs, clients, or years of industry work.
- **Leave sections empty rather than filling them.** The frontend hides blank
  fields by design, so an incomplete project renders as a smaller case study,
  not a gap. Placeholder text is worse than absence.
- **Do not add Claude/AI attribution** to commits, PR descriptions, code
  comments, or the site itself. Commits list Jahid as sole author.

If content is missing and you need it, ask — do not fill the hole.

## Commands

```bash
# Backend (from backend/, venv activated)
python manage.py runserver          # http://127.0.0.1:8000, admin at /admin/
python manage.py test               # 35 tests
python manage.py migrate
python manage.py seed_portfolio     # idempotent; loads all real content

# Frontend (from frontend/)
npm run dev                         # http://localhost:5173
npm test                            # vitest, 20 tests
npm run lint
npm run build
```

Run both test suites before considering a change done. Vite proxies `/api` and
`/media` to Django in development, so no CORS setup is needed locally.

## Architecture

**Request flow:** React page → `src/hooks/useApi.js` → `src/services/api.js` →
DRF viewset → serializer → model.

**Backend apps** live under `backend/apps/`: `profiles`, `projects`, `skills`,
`education`, `contact`. Routes are wired in `config/api_urls.py`.

The API is read-only except `POST /api/contact/`, which is rate-limited to 5
submissions per hour per IP and carries a honeypot field. Keep it that way — do
not add write endpoints.

**Frontend layers** under `frontend/src/`:

- `pages/` — route components, one per URL
- `sections/` — large composed blocks of the home page
- `components/` — reusable UI
- `hooks/` — data fetching and behavior
- `services/api.js` — the single place any URL is constructed

`@` aliases to `src/`.

## Conventions

**Python**

- Every model, viewset, and management command opens with a docstring saying
  what it is for, not what it does line by line.
- Models auto-generate `slug` from the name in `save()` when blank.
- Viewsets are `ReadOnlyModelViewSet` with `permission_classes = [AllowAny]`,
  `lookup_field = "slug"`, `pagination_class = None`.
- Prefetch related data in `get_queryset()`; the detail action prefetches more
  than the list action. Avoid N+1 queries in serializers.
- Image fields serialize through a `SerializerMethodField` that builds an
  absolute URI from the request, and fall back to a sensible `alt_text`.
- Settings read from `.env` via `python-decouple`. Never hardcode a secret or
  a host. New variables go in `.env.example` with a comment.

**JavaScript**

- No semicolons, single quotes, functional components only.
- Data fetching goes through `useApi`, which guards against setting state after
  unmount or after a newer request superseded the old one.
- Every animation must be disabled under `prefers-reduced-motion`
  (`usePrefersReducedMotion`), and no content may depend on an animation to
  become visible.
- Tests sit beside their component as `Name.test.jsx`.

**Both**

- Match the surrounding comment density: comments here explain *why*, and are
  sparse. Do not narrate obvious code.

## Media and deployment notes

- `backend/media/` **is committed on purpose** — Render wipes uploaded files on
  every redeploy, so screenshots must travel with the repository. Do not add it
  to `.gitignore`.
- `images/` and `cv/` are git-ignored. Only the optimized copies under
  `backend/media/` are committed, keeping full-resolution originals and CV
  personal details out of the public repo.
- Replace the photo or CV with `python manage.py update_profile_media`
  (`--dry-run` first). See the README for the full three-step flow.
- After adding or renaming a project, regenerate the sitemap:
  `python manage.py generate_sitemap --base-url https://yourdomain.com`.
- Deployment is documented in `DEPLOYMENT.md` (Vercel + Railway) and
  `DEPLOY_RENDER.md` (Render, the live setup).

## Reference documents

`docs/PORTFOLIO_PRD.pdf` specifies the site; `docs/ABOUT_JAHID.pdf` describes
the owner. Both are generated from HTML sources in the same folder. If a change
makes either document inaccurate, update the HTML and regenerate rather than
leaving the PDF stale.
