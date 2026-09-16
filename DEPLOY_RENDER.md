# Deploying to Render (free)

Frontend and backend on Render, PostgreSQL on Neon.

**Why Neon rather than Render's database:** Render's free Postgres is deleted
after 30 days. Neon's free tier does not expire, so the database outlives the
trial without any migration work later.

**Total cost: $0.**

---

## Before you start

Know this about Render's free tier:

| | Behaviour |
|---|---|
| **Backend sleeps** | After 15 minutes idle. The next visitor waits **~50 seconds**. |
| **Static frontend** | Never sleeps. Loads instantly. |
| **Fix** | $7/month upgrades the backend to always-on. |

The practical effect: your site appears instantly, but project data takes
~50 seconds to arrive if nobody has visited recently. Consider upgrading before
sending the link to recruiters.

---

## 1. Push to GitHub

```bash
git add .
git commit -m "Portfolio site"
git branch -M main
git remote add origin https://github.com/jhraihan/portfolio.git
git push -u origin main
```

Confirm no secrets were committed:

```bash
git ls-files | grep -c "\.env$"     # must print 0
```

> Screenshots and the résumé **are** committed, in `backend/media/`. Render
> wipes uploaded files on every redeploy, so they have to travel with the
> repository.

---

## 2. Database on Neon

1. Sign up at [neon.tech](https://neon.tech) with GitHub.
2. **Create project** → name it `portfolio` → region **Singapore** (closest to
   Bangladesh).
3. Copy the **connection string** from the dashboard. It looks like:

   ```
   postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

Keep it to hand — it goes into Render in the next step, and nowhere else.

---

## 3. Backend on Render

1. Sign in at [render.com](https://render.com) with GitHub.
2. **New → Web Service** → connect the repository.
3. Configure:

   | Field | Value |
   |---|---|
   | Name | `portfolio-api` |
   | Region | Singapore |
   | Root Directory | `backend` |
   | Runtime | Python 3 |
   | Build Command | `./build.sh` |
   | Start Command | `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT` |
   | Instance Type | Free |

4. **Environment variables** — add these before the first deploy:

   ```
   PYTHON_VERSION       3.12.0
   SECRET_KEY           <generate, see below>
   DEBUG                False
   USE_SQLITE           False
   DATABASE_URL         <the Neon connection string>
   ALLOWED_HOSTS        portfolio-api.onrender.com
   SECURE_SSL_REDIRECT  False
   ```

   Generate a fresh secret key — never reuse the development one:

   ```bash
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```

   `SECURE_SSL_REDIRECT` is **False** deliberately: Render terminates TLS ahead
   of the application, so letting Django redirect as well causes a loop.

5. **Create Web Service.** The first build takes 3–5 minutes.

6. Verify: `https://portfolio-api.onrender.com/api/projects/` returns JSON.

### Create your admin account

**Dashboard → Shell**:

```bash
python manage.py createsuperuser
```

Use a strong password — this one is on the public internet.

---

## 4. Frontend on Render

1. **New → Static Site** → same repository.
2. Configure:

   | Field | Value |
   |---|---|
   | Name | `portfolio-web` |
   | Root Directory | `frontend` |
   | Build Command | `npm ci && npm run build` |
   | Publish Directory | `dist` |

3. **Environment variable:**

   ```
   VITE_API_URL    https://portfolio-api.onrender.com/api
   ```

   The `/api` suffix matters — without it every request 404s.

4. **Create Static Site.**

### Client-side routing — required

Render does **not** read the `_redirects` file (that is a Netlify
convention). Without a rewrite rule, opening or refreshing a case study
URL returns 404.

Go to **portfolio-web → Redirects/Rewrites → Add Rule**:

| Field | Value |
|---|---|
| Source | `/*` |
| Destination | `/index.html` |
| Action | **Rewrite** |

It must be **Rewrite**, not Redirect: a redirect changes the address bar
and breaks client-side routing. The rule applies immediately, with no
rebuild.

---

## 5. Connect the two

Back on the **backend** service, add the frontend's URL:

```
CORS_ALLOWED_ORIGINS    https://portfolio-web.onrender.com
CSRF_TRUSTED_ORIGINS    https://portfolio-web.onrender.com
```

Save — Render redeploys automatically. Without this, the browser blocks every
API call.

---

## 6. Verify

Open `https://portfolio-web.onrender.com` and check:

- [ ] Hero shows your name and photo
- [ ] All five project cards show screenshots
- [ ] A case study opens, with its architecture diagram and gallery
- [ ] Refreshing a case study URL does **not** 404
- [ ] The résumé downloads
- [ ] The contact form submits and the message appears in `/admin/`
- [ ] Light/dark toggle works

If images are missing, the API is reachable but media is not — check that
`backend/media/` was committed.

---

## 7. Custom domain (recommended)

`jahidhasan.dev` reads considerably better than `portfolio-web.onrender.com`.
About $12/year from Namecheap or Cloudflare.

**Render → Static Site → Settings → Custom Domain**, then follow the DNS
instructions.

Afterwards, update and redeploy:

- Backend: `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`
- `frontend/index.html`: the canonical link and both `og:url` tags
- Sitemap:
  ```bash
  python manage.py generate_sitemap --base-url https://jahidhasan.dev
  ```

---

## Updating content later

Content edited through the admin lives in the Neon database and survives
redeploys. The build only seeds content when the database is empty, so your
edits are never overwritten.

**New screenshots are the exception.** Because media is served from the
repository, adding images means committing them:

```bash
python manage.py import_media     # optimise and attach
git add backend/media
git commit -m "Add screenshots"
git push                          # Render redeploys automatically
```

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| Site loads, no project data | Backend asleep — wait ~50s, or upgrade |
| `DisallowedHost` error | `ALLOWED_HOSTS` missing the Render hostname |
| Browser blocks API calls | `CORS_ALLOWED_ORIGINS` missing the frontend URL |
| Images 404 | `backend/media/` not committed |
| Refresh gives 404 | Rewrite rule missing — Render ignores `_redirects`, see step 4 |
| Too many redirects | `SECURE_SSL_REDIRECT` must be `False` on Render |
| `bad interpreter` on build | `build.sh` has CRLF endings — `.gitattributes` prevents this |

---

## Upgrading later

The single most valuable upgrade is **$7/month for an always-on backend**,
which removes the cold start. Everything else can stay free.
