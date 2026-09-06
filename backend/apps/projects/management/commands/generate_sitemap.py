"""Generate sitemap.xml from the live project list.

Run after adding or renaming a project so search engines see the new URL:
    python manage.py generate_sitemap --base-url https://yourdomain.com
"""

from datetime import date
from pathlib import Path
from xml.sax.saxutils import escape

from django.core.management.base import BaseCommand

from apps.projects.models import Project

STATIC_PATHS = [
    ("/", "1.0", "weekly"),
    ("/projects", "0.9", "weekly"),
    ("/about", "0.8", "monthly"),
    ("/contact", "0.7", "monthly"),
]


class Command(BaseCommand):
    help = "Write sitemap.xml and robots.txt into the frontend's public folder."

    def add_arguments(self, parser):
        parser.add_argument(
            "--base-url",
            default="https://example.com",
            help="Site root, with no trailing slash.",
        )
        parser.add_argument(
            "--output",
            default="../frontend/public",
            help="Directory to write into.",
        )

    def handle(self, *args, **options):
        base = options["base_url"].rstrip("/")
        out_dir = Path(options["output"]).resolve()
        out_dir.mkdir(parents=True, exist_ok=True)

        today = date.today().isoformat()
        entries = []

        for path, priority, frequency in STATIC_PATHS:
            entries.append((f"{base}{path}", today, priority, frequency))

        for project in Project.objects.all():
            entries.append(
                (
                    f"{base}/projects/{project.slug}",
                    project.updated_at.date().isoformat(),
                    "0.8",
                    "monthly",
                )
            )

        lines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ]
        for loc, lastmod, priority, frequency in entries:
            lines += [
                "  <url>",
                f"    <loc>{escape(loc)}</loc>",
                f"    <lastmod>{lastmod}</lastmod>",
                f"    <changefreq>{frequency}</changefreq>",
                f"    <priority>{priority}</priority>",
                "  </url>",
            ]
        lines.append("</urlset>")

        (out_dir / "sitemap.xml").write_text("\n".join(lines), encoding="utf-8")

        (out_dir / "robots.txt").write_text(
            f"User-agent: *\nAllow: /\n\nSitemap: {base}/sitemap.xml\n",
            encoding="utf-8",
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Wrote sitemap.xml ({len(entries)} URLs) and robots.txt to {out_dir}"
            )
        )
