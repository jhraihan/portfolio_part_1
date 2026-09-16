#!/usr/bin/env bash
# Render build step for the Django backend.
#
# Runs on every deploy. Migrations and collectstatic are idempotent, so
# re-running is safe. Content is seeded only when the database is empty,
# which keeps admin edits from being overwritten on the next deploy.

set -o errexit  # abort the build on the first failing command

pip install -r requirements/prod.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Seed only an empty database. seed_portfolio is idempotent, but it would
# also revert any content edited through the admin since the last deploy.
python manage.py shell <<'PY'
from apps.projects.models import Project

if Project.objects.exists():
    print("Content already present — skipping seed.")
else:
    from django.core.management import call_command
    print("Empty database — seeding portfolio content.")
    call_command("seed_portfolio")
PY

# Attach screenshots and the résumé.
#
# The image files ship with the repository, but the database rows that point
# at them do not — a fresh database has projects with no cover image. Run the
# import whenever any project is still missing one.
python manage.py shell <<'PY'
from apps.projects.models import Project

if Project.objects.filter(cover_image="").exists():
    from django.core.management import call_command
    print("Projects missing images — attaching committed media.")
    call_command("attach_media")
else:
    print("All projects have images — skipping media import.")
PY

# Create the admin account on first deploy.
#
# Render's free tier has no shell, so createsuperuser cannot be run
# interactively. The credentials come from environment variables and are
# used only when that user does not already exist, so a later password
# change through the admin is never overwritten.
#
# Remove ADMIN_PASSWORD from the Render dashboard once the account exists.
python manage.py shell <<'PY'
import os

from django.contrib.auth import get_user_model

User = get_user_model()

username = os.environ.get("ADMIN_USERNAME", "")
password = os.environ.get("ADMIN_PASSWORD", "")
email = os.environ.get("ADMIN_EMAIL", "")

if not username or not password:
    print("ADMIN_USERNAME/ADMIN_PASSWORD not set — skipping admin creation.")
elif User.objects.filter(username=username).exists():
    print(f"Admin '{username}' already exists — leaving it untouched.")
else:
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f"Admin '{username}' created.")
PY
