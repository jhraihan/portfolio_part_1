#!/usr/bin/env bash
# Render build step for the Django backend.
#
# Runs on every deploy, and every step is idempotent. seed_portfolio.py is the
# source of truth for project and profile text: sync_projects and
# sync_profile_copy write it on each deploy, so lasting content changes belong
# in that file rather than the admin.

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

# Write projects from the seed: new ones are created, existing ones updated,
# and any named in REMOVED_PROJECTS deleted. Must run before attach_media, so
# a newly added project exists to receive its images.
python manage.py sync_projects

# Keep profile copy in step with the seed. Only narrative fields are touched —
# media and links are left alone.
python manage.py sync_profile_copy

# Point records at the media files committed under backend/media/. The files
# ship with the repository but the rows that reference them do not, and a
# replaced file leaves a stale reference behind; attach_media fills the first
# and repairs the second, and leaves anything already intact alone.
python manage.py attach_media

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
