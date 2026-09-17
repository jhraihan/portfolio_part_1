"""Replace the profile photo and/or résumé from the repository source folders.

Reads whatever is newest in `images/` and `cv/`, optimises the photo, writes
both into MEDIA_ROOT, and points the Profile record at them. Old files are
removed so `backend/media/` does not accumulate unused variants.

Usage
    python manage.py update_profile_media              # both
    python manage.py update_profile_media --photo-only
    python manage.py update_profile_media --cv-only
    python manage.py update_profile_media --dry-run

After running, commit backend/media so the new files reach production —
Render's filesystem is ephemeral, so media travels with the repository.
"""

import io
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction
from PIL import Image

from apps.profiles.models import Profile

REPO_ROOT = Path(__file__).resolve().parents[5]
IMAGES_DIR = REPO_ROOT / "images"
CV_DIR = REPO_ROOT / "cv"

IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp"}

# Square, and large enough for the hero at 2x on a retina display.
PHOTO_SIZE = 800
PHOTO_QUALITY = 88


class Command(BaseCommand):
    help = "Replace the profile photo and résumé from images/ and cv/."

    def add_arguments(self, parser):
        parser.add_argument("--photo-only", action="store_true")
        parser.add_argument("--cv-only", action="store_true")
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Report what would change without writing.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        self.dry_run = options["dry_run"]
        if self.dry_run:
            self.stdout.write(self.style.WARNING("Dry run — nothing written.\n"))

        profile = Profile.objects.first()
        if profile is None:
            self.stderr.write("No Profile record exists. Run seed_portfolio first.")
            return

        do_photo = not options["cv_only"]
        do_cv = not options["photo_only"]

        if do_photo:
            self._replace_photo(profile)
        if do_cv:
            self._replace_cv(profile)

        if not self.dry_run:
            self.stdout.write(
                self.style.SUCCESS(
                    "\nDone. Commit backend/media so the change reaches production:"
                    "\n  git add backend/media && git commit -m 'Update profile media' && git push"
                )
            )

    # -- photo --------------------------------------------------------------

    def _replace_photo(self, profile):
        source = self._newest(IMAGES_DIR, IMAGE_SUFFIXES)
        if source is None:
            self.stderr.write(f"! no image found in {IMAGES_DIR}")
            return

        self.stdout.write(f"Photo source: {source.name}")

        img = Image.open(source)
        self.stdout.write(
            f"  original: {img.size[0]}x{img.size[1]}, "
            f"{source.stat().st_size / 1024:.0f} KB"
        )

        # Square crop from the centre of the full height, which keeps headroom
        # above the subject rather than cropping tight to the face.
        img = img.convert("RGB")
        width, height = img.size
        side = min(width, height)
        left = (width - side) // 2
        top = 0 if height <= width else (height - side) // 4
        img = img.crop((left, top, left + side, top + side))
        img = img.resize((PHOTO_SIZE, PHOTO_SIZE), Image.LANCZOS)

        buffer = io.BytesIO()
        img.save(
            buffer,
            "JPEG",
            quality=PHOTO_QUALITY,
            optimize=True,
            progressive=True,
        )
        buffer.seek(0)
        self.stdout.write(
            f"  optimised: {PHOTO_SIZE}x{PHOTO_SIZE}, "
            f"{buffer.getbuffer().nbytes / 1024:.0f} KB"
        )

        if self.dry_run:
            return

        # Clear the whole profile directory so stale variants do not linger
        # and confuse attach_media, which picks the newest file.
        profile_dir = Path(settings.MEDIA_ROOT) / "profile"
        if profile_dir.exists():
            for old in profile_dir.iterdir():
                if old.is_file():
                    old.unlink()
                    self.stdout.write(f"  removed old: {old.name}")

        profile.photo.save(f"{source.stem}.jpg", File(buffer), save=True)
        self.stdout.write(self.style.SUCCESS(f"  attached: {profile.photo.name}"))

    # -- résumé -------------------------------------------------------------

    def _replace_cv(self, profile):
        source = self._newest(CV_DIR, {".pdf"})
        if source is None:
            self.stderr.write(f"! no PDF found in {CV_DIR}")
            return

        self.stdout.write(
            f"\nCV source: {source.name} ({source.stat().st_size / 1024:.0f} KB)"
        )

        if self.dry_run:
            return

        resume_dir = Path(settings.MEDIA_ROOT) / "resume"
        if resume_dir.exists():
            for old in resume_dir.iterdir():
                if old.is_file():
                    old.unlink()
                    self.stdout.write(f"  removed old: {old.name}")

        with open(source, "rb") as fh:
            profile.resume.save(source.name, File(fh), save=True)
        self.stdout.write(self.style.SUCCESS(f"  attached: {profile.resume.name}"))

    # -- helpers ------------------------------------------------------------

    @staticmethod
    def _newest(directory, suffixes):
        """Most recently modified file in `directory` matching `suffixes`."""
        if not directory.exists():
            return None
        candidates = [
            f
            for f in directory.iterdir()
            if f.is_file() and f.suffix.lower() in suffixes
        ]
        if not candidates:
            return None
        return max(candidates, key=lambda f: f.stat().st_mtime)
