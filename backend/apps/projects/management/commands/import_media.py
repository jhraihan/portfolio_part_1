"""Import project screenshots and the résumé from the repository folders.

Screenshots live in `images/<folder>/` and are matched to projects by the
mapping below. Each image is downscaled and re-encoded before it reaches the
media store, because raw PNG screenshots are typically 10x larger than the
site needs and page weight is a stated priority.

The first image named in COVERS becomes the project's cover; the rest fill the
case study gallery in the order listed.

Idempotent: re-running replaces the previously imported gallery rather than
appending duplicates.
"""

from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction
from PIL import Image

from apps.profiles.models import Profile
from apps.projects.models import Project, ProjectImage

# Repository root, three levels above manage.py's directory.
REPO_ROOT = Path(__file__).resolve().parents[5]
IMAGES_DIR = REPO_ROOT / "images"
CV_DIR = REPO_ROOT / "cv"

# project slug -> source folder under images/
FOLDERS = {
    "micromart": "micro-mart",
    "eduflow": "edu-flow",
    "intellichat": "intelli-chat",
    "medidesk": "medi-desk",
    "promptcanvas": "prompt-canvas",
}

# The screenshot that shows the product's name most clearly. Matched as a
# substring of the filename so the long timestamps stay readable here.
COVERS = {
    "micromart": "221100",
    "eduflow": "230511",
    "intellichat": "220646",
    "medidesk": "175313",
    "promptcanvas": "113849",
}

# Captions in gallery order, after the cover is removed. Falls back to a
# generic label when a project has more images than captions.
CAPTIONS = {
    "micromart": [
        "Product catalogue and category browsing",
        "Product detail and purchase flow",
        "Cart and checkout",
        "Seller dashboard",
    ],
    "eduflow": [
        "Course overview",
        "Assignments and submissions",
        "Results and grading",
        "Administration",
    ],
    "intellichat": [
        "Sign-in with demo access",
        "Streaming response with syntax-highlighted code",
        "Conversation history",
    ],
    "medidesk": [
        "Appointments and scheduling",
        "Patient records",
        "Prescriptions and billing",
    ],
    "promptcanvas": [
        "Prompt input and generation",
        "Generated image detail",
        "Generation history",
    ],
}

# Long edge in pixels. Wide enough for a retina case-study view without
# carrying full desktop-capture resolution.
MAX_WIDTH = 1600
JPEG_QUALITY = 84


class Command(BaseCommand):
    help = "Import screenshots and résumé from the images/ and cv/ folders."

    def add_arguments(self, parser):
        parser.add_argument(
            "--skip-resume",
            action="store_true",
            help="Import screenshots only.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Report what would be imported without writing anything.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        self.dry_run = options["dry_run"]
        if self.dry_run:
            self.stdout.write(self.style.WARNING("Dry run — nothing written.\n"))

        if not IMAGES_DIR.exists():
            self.stderr.write(f"Images directory not found: {IMAGES_DIR}")
            return

        total_images = 0
        for slug, folder in FOLDERS.items():
            total_images += self._import_project(slug, folder)

        if not options["skip_resume"]:
            self._import_resume()

        self.stdout.write(
            self.style.SUCCESS(f"\n{total_images} screenshots imported.")
        )

    # -- screenshots --------------------------------------------------------

    def _import_project(self, slug, folder):
        try:
            project = Project.objects.get(slug=slug)
        except Project.DoesNotExist:
            self.stderr.write(f"  ! no project with slug '{slug}'")
            return 0

        source_dir = IMAGES_DIR / folder
        if not source_dir.exists():
            self.stderr.write(f"  ! missing folder {source_dir}")
            return 0

        files = sorted(
            p for p in source_dir.iterdir()
            if p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}
        )
        if not files:
            self.stderr.write(f"  ! no images in {source_dir}")
            return 0

        # Pull the cover out of the list so it is not repeated in the gallery.
        cover_key = COVERS.get(slug, "")
        cover = next((p for p in files if cover_key in p.name), files[0])
        gallery = [p for p in files if p != cover]

        self.stdout.write(f"\n{project.title}")
        self.stdout.write(f"  cover:   {cover.name}")

        if not self.dry_run:
            # Remove previously imported gallery images so re-running does not
            # accumulate duplicates.
            for existing in project.images.all():
                existing.image.delete(save=False)
                existing.delete()

            if project.cover_image:
                project.cover_image.delete(save=False)

            data, name = self._optimise(cover)
            project.cover_image.save(name, File(data), save=True)

        captions = CAPTIONS.get(slug, [])
        for index, path in enumerate(gallery):
            caption = (
                captions[index] if index < len(captions)
                else f"{project.title} interface"
            )
            self.stdout.write(f"  gallery: {path.name}  — {caption}")

            if not self.dry_run:
                data, name = self._optimise(path)
                image = ProjectImage(
                    project=project,
                    caption=caption,
                    alt_text=f"{project.title} — {caption.lower()}",
                    order=index,
                )
                image.image.save(name, File(data), save=False)
                image.save()

        return len(files)

    def _optimise(self, path):
        """Downscale and re-encode a screenshot, returning an open file object.

        Screenshots are captured at full desktop resolution as PNG, which is
        far heavier than the site needs. Converting to progressive JPEG at a
        capped width typically cuts size by an order of magnitude with no
        visible difference at display size.
        """
        img = Image.open(path)

        # Flatten transparency onto white; JPEG cannot carry an alpha channel.
        if img.mode in ("RGBA", "LA", "P"):
            img = img.convert("RGBA")
            background = Image.new("RGB", img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[-1])
            img = background
        else:
            img = img.convert("RGB")

        if img.width > MAX_WIDTH:
            height = round(img.height * MAX_WIDTH / img.width)
            img = img.resize((MAX_WIDTH, height), Image.LANCZOS)

        import io

        buffer = io.BytesIO()
        img.save(
            buffer,
            "JPEG",
            quality=JPEG_QUALITY,
            optimize=True,
            progressive=True,
        )
        buffer.seek(0)

        original_kb = path.stat().st_size / 1024
        new_kb = buffer.getbuffer().nbytes / 1024
        self.stdout.write(
            f"           {original_kb:>6.0f} KB -> {new_kb:>5.0f} KB  "
            f"({img.width}x{img.height})"
        )

        return buffer, f"{path.stem.replace(' ', '-').lower()}.jpg"

    # -- résumé -------------------------------------------------------------

    def _import_resume(self):
        if not CV_DIR.exists():
            self.stderr.write(f"\n! CV directory not found: {CV_DIR}")
            return

        pdfs = sorted(CV_DIR.glob("*.pdf"))
        if not pdfs:
            self.stderr.write("\n! no PDF found in cv/")
            return

        # Newest file wins, so an updated CV dropped in is picked up.
        resume = max(pdfs, key=lambda p: p.stat().st_mtime)

        profile = Profile.objects.first()
        if profile is None:
            self.stderr.write("\n! no Profile record exists")
            return

        self.stdout.write(f"\nRésumé: {resume.name}")

        if not self.dry_run:
            if profile.resume:
                profile.resume.delete(save=False)
            with open(resume, "rb") as fh:
                profile.resume.save(resume.name, File(fh), save=True)
            self.stdout.write(self.style.SUCCESS("  attached to profile"))
