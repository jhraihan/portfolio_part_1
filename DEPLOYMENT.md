# Deployment

Frontend on Vercel (free), backend and PostgreSQL on Railway (about $5/month).

Do the backend first — the frontend needs its URL.

---

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "Portfolio site"
git branch -M main
git remote add origin https://github.com/jhraihan/portfolio.git
git push -u origin main
```

Confirm `.env` is **not** in the repository:

```bash
git ls-files | grep -c "\.env$"      # must print 0
```

---

## 2. Backend on Railway

1. Sign in at [railway.app](https://railway.app) with GitHub.
2. **New Project → Deploy from GitHub repo** → select the repository.
3. **Settings → Root Directory**: `backend`
4. **New → Database → Add PostgreSQL** in the same project.

### Environment variables

**Settings → Variables**:

```
SECRET_KEY=<generate a new one, see below>
DEBUG=False
ALLOWED_HOSTS=<your-app>.up.railway.app
USE_SQLITE=False
DATABASE_URL=${{Postgres.DATABASE_URL}}

CORS_ALLOWED_ORIGINS=https://<your-site>.vercel.app
CSRF_TRUSTED_ORIGINS=https://<your-site>.vercel.app
SECURE_SSL_REDIRECT=True
```

`${{Postgres.DATABASE_URL}}` is a Railway reference — it substitutes the real
connection string at deploy time, so no password is ever typed or committed.
One variable replaces the five discrete `DB_*` settings.

Generate a fresh production secret key (never reuse the development one):

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Start command

**Settings → Deploy → Custom Start Command**:

```
python manage.py migrate && python manage.py collectstatic --noinput && gunicorn config.wsgi --bind 0.0.0.0:$PORT
```

### Load content

Once deployed, open Railway's shell:

```bash
python manage.py seed_portfolio
python manage.py createsuperuser
```

Verify: `https://<your-app>.up.railway.app/api/projects/` should return JSON.

---

## 3. Frontend on Vercel

1. Sign in at [vercel.com](https://vercel.com) with GitHub, **Add New → Project**.
2. Select the repository.
3. **Root Directory**: `frontend`
4. Framework preset: **Vite** (auto-detected)

### Environment variable

```
VITE_API_URL=https://<your-app>.up.railway.app/api
```

### SPA routing

Client-side routes must not 404 on refresh. Create `frontend/vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Deploy.

---

## 4. Connect them

Back in Railway, set `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` to the
real Vercel URL and redeploy.

---

## 5. Custom domain (recommended)

`jahidhasan.dev` reads considerably better than a `.vercel.app` subdomain.
Buy from Namecheap or Cloudflare (about $12/year).

**Vercel → Settings → Domains** → add it and follow the DNS instructions.

Then update, and redeploy each side:

- Railway: `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`
- `frontend/index.html`: the canonical link and both `og:url` tags
- Sitemap:
  ```bash
  python manage.py generate_sitemap --base-url https://jahidhasan.dev
  ```

---

## 6. Media files

Railway's filesystem is ephemeral — uploaded screenshots are lost on redeploy.
Once you start uploading images regularly, move media to object storage:

```bash
pip install django-storages boto3
```

Then configure S3 or Cloudflare R2 (R2 has a free tier) in `settings.py`.
Until then, re-upload after a redeploy, or commit images to the repository.

---

## Checklist

- [ ] `.env` not in git
- [ ] Fresh `SECRET_KEY` in production
- [ ] `DEBUG=False`
- [ ] `ALLOWED_HOSTS` set to the real domain
- [ ] CORS and CSRF origins set to the real frontend URL
- [ ] `seed_portfolio` run
- [ ] Superuser created with a strong password
- [ ] Contact form submits successfully in production
- [ ] Refreshing `/projects/micromart` does not 404
- [ ] Sitemap regenerated with the real domain

---

## Alternatives

| Option | Cost | Trade-off |
|---|---|---|
| Vercel + Render | Free | Backend sleeps after 15 min; ~50s cold start. Avoid. |
| Vercel + Neon | Free | Serverless Postgres with a generous free tier; pairs well with any host. |
| VPS (Hostinger, DigitalOcean) | $4–6/mo | Full control; you manage Nginx, Gunicorn, and SSL. |
