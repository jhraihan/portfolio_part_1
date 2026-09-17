# Portfolio — Md. Jahid Hasan Raihan

A personal portfolio built with Django REST Framework and React. Content is
managed entirely through the Django admin, so projects, skills, screenshots,
and links can be updated without touching code.

```
backend/     Django 5 + DRF API, admin CMS
frontend/    React 18 + Vite + Tailwind
images/      Original source images (not served)
```

---

## Running locally

Two terminals. Backend first.

### Backend

```bash
cd backend
venv\Scripts\activate            # Windows
# source venv/bin/activate       # macOS / Linux

pip install -r requirements/dev.txt
python manage.py migrate
python manage.py seed_portfolio   # loads all content
python manage.py createsuperuser  # if you need a new admin login
python manage.py runserver
```

Runs at `http://127.0.0.1:8000`. Admin at `/admin/`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173`. API requests are proxied to Django, so no
CORS configuration is needed in development.

---

## Editing content

Everything visible on the site is editable at `http://127.0.0.1:8000/admin/`.

| Section | Where |
|---|---|
| Name, title, hero text, about, links, photo, resume | **Profiles → Profile** |
| Projects, case studies, features, screenshots | **Projects → Projects** |
| Technology tags | **Projects → Technologies** |
| Skills and levels | **Skills → Skill categories** |
| Coursework | **Skills → Coursework subjects** |
| Degree | **Education → Education** |
| Contact form submissions | **Contact → Contact messages** |

### Adding things later

Empty fields are hidden on the site rather than rendered blank, so partial
content never looks unfinished.

**Screenshots** — open a project, scroll to *Project images*, upload, set an
order and alt text. The placeholder is replaced automatically.

**A video walkthrough** — paste a YouTube URL into a project's `video_url`.
An embedded player appears in the case study.

**A live demo** — paste the URL into `live_url`. The "Live demo" button
appears; while empty, no dead button is shown.

**Your resume** — upload a PDF to *Profile → resume*. The download button
appears in the hero and about page.

**Changing a repository URL** — edit `github_url` on the project.

After adding or renaming a project, regenerate the sitemap:

```bash
python manage.py generate_sitemap --base-url https://yourdomain.com
```

---

## Tests

```bash
cd backend  && python manage.py test     # 35 tests
cd frontend && npm test                  # 20 tests
```

---

## Switching to PostgreSQL

Development starts on SQLite so the project runs before Postgres is set up.
The database is resolved in this order:

1. `USE_SQLITE=True` — SQLite, the local default
2. `DATABASE_URL` — a single connection string, which is what managed hosts give you
3. `DB_NAME` / `DB_USER` / `DB_PASSWORD` / `DB_HOST` / `DB_PORT` — discrete settings

### Local PostgreSQL

```sql
CREATE DATABASE portfolio_db;
```

In `backend/.env`, set `USE_SQLITE=False` and fill in the `DB_*` values. Then:

```bash
python manage.py migrate
python manage.py seed_portfolio
```

### A hosted database (Railway, Neon, Supabase, Render, Fly)

Set two variables and ignore the `DB_*` values entirely:

```
USE_SQLITE=False
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

TLS is required automatically whenever `DEBUG=False`, which is what managed
Postgres providers expect.

---

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full Vercel + Railway walkthrough.

---

## Replacing your photo or CV

Both live in the repository, because Render wipes uploaded files on every
redeploy. Replacing them is three steps.

1. **Drop the new file in the source folder**, keeping any name you like:

   - photo → `images/`
   - CV → `cv/`

   The newest file in each folder wins, so the old one can stay or go.

2. **Run the command.** It crops and compresses the photo, removes the
   previous files, and updates the database:

   ```bash
   cd backend
   venv\Scripts\activate
   python manage.py update_profile_media --dry-run   # preview
   python manage.py update_profile_media
   ```

   Use `--photo-only` or `--cv-only` to change just one.

3. **Commit and push** — Render redeploys itself:

   ```bash
   git add backend/media
   git commit -m "Update profile photo"
   git push
   ```

The live site updates in about three minutes. Note that `images/` and `cv/`
are git-ignored: only the optimised copies under `backend/media/` are
committed, which keeps the original full-resolution photo and any personal
details in the CV source out of the public repository.

---

## Interface notes

- **Command palette** — `Cmd/Ctrl + K` from anywhere. Searches pages and
  projects, toggles the theme, and opens external links. New projects appear
  in it automatically.
- **Architecture diagrams** — each case study renders a request-flow diagram
  as inline SVG. The flows are defined in
  `frontend/src/components/ArchitectureDiagram.jsx`; a project without a
  defined flow simply shows no diagram.
- **Motion** — every animation is disabled under `prefers-reduced-motion`,
  and no content depends on an animation to become visible.

---

## Notes

- `.env` is git-ignored. `.env.example` documents every required variable.
- The public API is read-only. The only write endpoint is the contact form,
  which is rate-limited to 5 submissions per hour per IP and protected by a
  honeypot field.
- A stored CGPA is only published when *show result* is enabled, so it can be
  recorded privately.
