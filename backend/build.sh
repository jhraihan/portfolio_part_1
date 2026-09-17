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
from apps.profiles.models import Profile
from apps.projects.models import Project

profile = Profile.objects.first()
missing = (
    Project.objects.filter(cover_image="").exists()
    or (profile is not None and not profile.photo)
    or (profile is not None and not profile.resume)
)

if missing:
    from django.core.management import call_command
    print("Media missing — attaching committed files.")
    call_command("attach_media")
else:
    print("All media already attached — skipping.")
PY

# Keep profile copy in step with the seed definition.
#
# seed_portfolio only runs against an empty database, so wording edited in
# the seed file would otherwise never reach an existing deployment. Only
# narrative fields are touched — media and links are left alone.
python manage.py sync_profile_copy

# Set the YouTube walkthrough URLs.
#
# These live outside seed_portfolio because seed only runs against an empty
# database. The command skips any project that already has a URL, so a link
# changed through the admin survives the next deploy.
python manage.py set_video_urls

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
