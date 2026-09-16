"""Set each project's YouTube walkthrough URL.

The video links live here rather than in seed_portfolio because seed only runs
against an empty database — it would never reach a deployment whose content
was already created. This command sets the URL on any project that does not
have one, so a fresh deploy and an existing one both end up correct.

Idempotent: a project that already has a video_url is left alone, so a link
changed through the admin is never overwritten.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.projects.models import Project

VIDEO_URLS = {
    "micromart": "https://youtu.be/6ujWklMaXg0",
    "eduflow": "https://youtu.be/yTR0klKN5f4",
    "intellichat": "https://youtu.be/D6H_cSP2K68",
    "medidesk": "https://youtu.be/PQhEbOxRwpY",
    "promptcanvas": "https://youtu.be/WWjRr_MXvc0",
}


class Command(BaseCommand):
    help = "Set the YouTube walkthrough URL on projects that lack one."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Overwrite URLs that are already set.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        force = options["force"]
        updated = 0

        for slug, url in VIDEO_URLS.items():
            try:
                project = Project.objects.get(slug=slug)
            except Project.DoesNotExist:
                self.stderr.write(f"  ! no project '{slug}'")
                continue

            if project.video_url and not force:
                self.stdout.write(f"  {project.title:14} already set")
                continue

            project.video_url = url
            project.save(update_fields=["video_url"])
            self.stdout.write(f"  {project.title:14} -> {url}")
            updated += 1

        self.stdout.write(self.style.SUCCESS(f"\n{updated} video URLs set."))
