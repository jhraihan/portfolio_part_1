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
