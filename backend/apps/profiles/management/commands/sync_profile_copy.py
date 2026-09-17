"""Push edited profile copy from seed_portfolio to an existing database.

seed_portfolio only runs against an empty database, so wording changed in the
seed file never reaches a deployment whose content already exists. This
command updates the specific copy fields from the seed definition.

It deliberately touches only text: photo, résumé, links and every other field
are left alone. Run it after editing PROFILE in seed_portfolio.py.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.profiles.management.commands.seed_portfolio import PROFILE
from apps.profiles.models import Profile

# Only the narrative fields. Anything not listed here is never overwritten.
COPY_FIELDS = [
    "tagline",
    "hero_intro",
    "about_short",
    "about_long",
    "meta_description",
    "availability",
    "title",
]


class Command(BaseCommand):
    help = "Update profile copy from the seed definition."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would change without writing.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        profile = Profile.objects.first()
        if profile is None:
            self.stderr.write("No Profile record exists.")
            return

        changed = []
        for field in COPY_FIELDS:
            new = PROFILE.get(field)
            if new is None:
                continue
            current = getattr(profile, field)
            if current != new:
                changed.append(field)
                if not options["dry_run"]:
                    setattr(profile, field, new)

        if not changed:
            self.stdout.write("Profile copy already matches the seed.")
            return

        if options["dry_run"]:
            self.stdout.write(f"Would update: {', '.join(changed)}")
            return

        profile.save(update_fields=changed)
        self.stdout.write(
            self.style.SUCCESS(f"Updated: {', '.join(changed)}")
        )
