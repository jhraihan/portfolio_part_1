"""Bring project records in an existing database in line with the seed.

seed_portfolio only runs against an empty database, so a project added,
reworded or removed in seed_portfolio.py never reaches a deployment whose
content already exists. This command closes that gap: it writes every project
in PROJECTS, matched by slug, and deletes those named in REMOVED_PROJECTS.

The seed is the source of truth for project text and links. An edit made only
in the admin is overwritten on the next deploy, so make lasting changes in
seed_portfolio.py. Media fields are never touched — attach_media owns those.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.profiles.management.commands.seed_portfolio import (
    REMOVED_PROJECTS,
    upsert_projects,
    upsert_technologies,
)
from apps.projects.models import Project


class Command(BaseCommand):
    help = "Write the seed's projects to the database and drop removed ones."

    @transaction.atomic
    def handle(self, *args, **options):
        tech_map = upsert_technologies(self.stdout.write)
        upsert_projects(tech_map, self.stdout.write)

        for slug in REMOVED_PROJECTS:
            project = Project.objects.filter(slug=slug).first()
            if project is None:
                continue
            # Gallery rows cascade with the project. Their files are not
            # deleted here: they live in the repository, and removing them is
            # a commit, not a deploy-time side effect.
            project.delete()
            self.stdout.write(f"  {slug} removed.")

        self.stdout.write(self.style.SUCCESS("Projects in sync with the seed."))
