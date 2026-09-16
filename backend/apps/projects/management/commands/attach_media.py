"""Attach media files that already exist in MEDIA_ROOT to their records.

`import_media` reads the original screenshots from the repository's images/
and cv/ folders, optimises them, and writes into MEDIA_ROOT. Those source
folders are deliberately not committed, so on a fresh deploy they are absent —
but the optimised files under backend/media/ *are* committed.

This command bridges that gap: it points the database rows at files that are
already on disk, without re-encoding anything. Run it after seeding a fresh
database so covers, galleries and the résumé are populated.

Idempotent: records that already reference a file are left alone.
"""

from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.profiles.models import Profile
from apps.projects.models import Project, ProjectImage

COVERS_DIR = "projects/covers"
SHOTS_DIR = "projects/screenshots"
RESUME_DIR = "resume"

# Which optimised filename belongs to which project. The stems come from the
# original screenshot timestamps and are stable once imported.
COVERS = {
    "micromart": "screenshot-2026-09-07-221100.jpg",
    "eduflow": "screenshot-2026-09-11-230511.jpg",
    "intellichat": "screenshot-2026-09-09-220646.jpg",
    "medidesk": "screenshot-2026-09-14-175313.jpg",
    "promptcanvas": "screenshot-2026-09-11-113849.jpg",
}

# Gallery images in display order, with their captions.
GALLERIES = {
    "micromart": [
        ("screenshot-2026-09-07-221111.jpg", "Product catalogue and category browsing"),
        ("screenshot-2026-09-07-221122.jpg", "Product detail and purchase flow"),
        ("screenshot-2026-09-07-223935.jpg", "Cart and checkout"),
        ("screenshot-2026-09-07-223946.jpg", "Seller dashboard"),
    ],
    "eduflow": [
        ("screenshot-2026-09-11-230523.jpg", "Course overview"),
        ("screenshot-2026-09-11-230535.jpg", "Assignments and submissions"),
        ("screenshot-2026-09-11-230549.jpg", "Results and grading"),
        ("screenshot-2026-09-11-230601.jpg", "Administration"),
    ],
    "intellichat": [
        ("screenshot-2026-09-09-220636.jpg", "Sign-in with demo access"),
        ("screenshot-2026-09-09-220709.jpg", "Streaming response with syntax-highlighted code"),
        ("screenshot-2026-09-09-221030.jpg", "Conversation history"),
    ],
    "medidesk": [
        ("screenshot-2026-09-14-175326.jpg", "Appointments and scheduling"),
        ("screenshot-2026-09-14-175338.jpg", "Patient records"),
        ("screenshot-2026-09-14-175353.jpg", "Prescriptions and billing"),
    ],
    "promptcanvas": [
        ("screenshot-2026-09-11-113902.jpg", "Prompt input and generation"),
        ("screenshot-2026-09-11-113912.jpg", "Generated image detail"),
        ("screenshot-2026-09-11-113942.jpg", "Generation history"),
    ],
}


class Command(BaseCommand):
    help = "Point database records at media files already present in MEDIA_ROOT."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Reattach even where a record already references a file.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        self.force = options["force"]
        root = Path(settings.MEDIA_ROOT)

        if not root.exists():
            self.stderr.write(f"MEDIA_ROOT does not exist: {root}")
            return

        attached = 0
        for slug in COVERS:
            attached += self._attach_project(root, slug)

        self._attach_resume(root)

        self.stdout.write(self.style.SUCCESS(f"\n{attached} images attached."))

    def _attach_project(self, root, slug):
        try:
            project = Project.objects.get(slug=slug)
        except Project.DoesNotExist:
            self.stderr.write(f"  ! no project '{slug}'")
            return 0

        count = 0
        self.stdout.write(f"\n{project.title}")

        # Cover
        cover_name = f"{COVERS_DIR}/{COVERS[slug]}"
        if project.cover_image and not self.force:
            self.stdout.write("  cover already set")
        elif (root / cover_name).exists():
            # Assigning the name references the existing file directly, with
            # no copy and no re-encode.
            project.cover_image.name = cover_name
            project.save(update_fields=["cover_image"])
            self.stdout.write(f"  cover   -> {COVERS[slug]}")
            count += 1
        else:
            self.stderr.write(f"  ! missing {cover_name}")

        # Gallery
        existing = project.images.count()
        if existing and not self.force:
            self.stdout.write(f"  gallery already has {existing} images")
            return count

        if self.force:
            project.images.all().delete()

        for order, (filename, caption) in enumerate(GALLERIES.get(slug, [])):
            name = f"{SHOTS_DIR}/{filename}"
            if not (root / name).exists():
                self.stderr.write(f"  ! missing {name}")
                continue

            image = ProjectImage(
                project=project,
                caption=caption,
                alt_text=f"{project.title} — {caption.lower()}",
                order=order,
            )
            image.image.name = name
            image.save()
            self.stdout.write(f"  gallery -> {filename}")
            count += 1

        return count

    def _attach_resume(self, root):
        profile = Profile.objects.first()
        if profile is None:
            self.stderr.write("\n! no Profile record")
            return

        if profile.resume and not self.force:
            self.stdout.write("\nRésumé already set")
            return

        resume_dir = root / RESUME_DIR
        if not resume_dir.exists():
            self.stderr.write(f"\n! missing {resume_dir}")
            return

        pdfs = sorted(resume_dir.glob("*.pdf"))
        if not pdfs:
            self.stderr.write("\n! no PDF in media/resume/")
            return

        profile.resume.name = f"{RESUME_DIR}/{pdfs[0].name}"
        profile.save(update_fields=["resume"])
        self.stdout.write(f"\nRésumé  -> {pdfs[0].name}")
