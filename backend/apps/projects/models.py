from django.db import models
from django.utils.text import slugify


class Technology(models.Model):
    """A technology tag shared across projects. Drives the project filter."""

    CATEGORY_CHOICES = [
        ("language", "Language"),
        ("frontend", "Frontend"),
        ("backend", "Backend"),
        ("database", "Database"),
        ("devops", "DevOps"),
        ("tool", "Tool"),
        ("service", "External Service"),
    ]

    name = models.CharField(max_length=60, unique=True)
    slug = models.SlugField(max_length=60, unique=True, blank=True)
    category = models.CharField(
        max_length=20, choices=CATEGORY_CHOICES, default="tool"
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]
        verbose_name_plural = "Technologies"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        return super().save(*args, **kwargs)


class Project(models.Model):
    """A portfolio project and its full case study.

    Case study sections are individually optional. The frontend hides any
    section left blank, so an incomplete project never renders as a gap.
    """

    STATUS_CHOICES = [
        ("completed", "Completed"),
        ("in_progress", "In Progress"),
        ("planned", "Planned"),
    ]

    TYPE_CHOICES = [
        ("web_app", "Web Application"),
        ("api", "API"),
        ("ai", "AI Application"),
        ("tool", "Tool"),
        ("other", "Other"),
    ]

    # Identity
    title = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    subtitle = models.CharField(
        max_length=200, help_text="One line describing what it is."
    )
    summary = models.TextField(help_text="Short paragraph used on project cards.")

    project_type = models.CharField(
        max_length=20, choices=TYPE_CHOICES, default="web_app"
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="completed"
    )
    is_solo = models.BooleanField(
        default=True, help_text="Uncheck for team projects; then fill in your role."
    )
    role = models.CharField(
        max_length=200,
        blank=True,
        help_text="Your specific contribution. Required for team projects.",
    )

    # Case study sections. Blank sections are hidden by the frontend.
    problem = models.TextField(blank=True, help_text="What problem it solves and why.")
    solution = models.TextField(blank=True, help_text="The approach taken.")
    architecture = models.TextField(
        blank=True, help_text="How a request flows through the system."
    )
    challenges = models.TextField(
        blank=True, help_text="The hardest problem and how it was solved."
    )
    lessons = models.TextField(blank=True, help_text="What working on this taught you.")

    technologies = models.ManyToManyField(
        Technology, related_name="projects", blank=True
    )

    # Links. Buttons appear only when the corresponding field is filled.
    github_url = models.URLField(blank=True)
    live_url = models.URLField(
        blank=True, help_text="Live demo. The button is hidden while empty."
    )
    video_url = models.URLField(
        blank=True,
        help_text="YouTube URL. An embedded player appears once this is set.",
    )

    # Display
    cover_image = models.ImageField(upload_to="projects/covers/", blank=True, null=True)
    accent_label = models.CharField(
        max_length=40,
        blank=True,
        help_text='Small label on the card, e.g. "E-commerce".',
    )
    is_featured = models.BooleanField(
        default=False, help_text="Featured projects appear on the home page."
    )
    order = models.PositiveIntegerField(
        default=0, help_text="Lower numbers appear first."
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "-created_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        return super().save(*args, **kwargs)

    @property
    def has_case_study(self):
        return any([self.problem, self.architecture, self.challenges, self.lessons])


class ProjectFeature(models.Model):
    """A single feature listed in a project's case study."""

    project = models.ForeignKey(
        Project, related_name="features", on_delete=models.CASCADE
    )
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.project.title} — {self.title}"


class ProjectImage(models.Model):
    """A screenshot in a project's gallery."""

    project = models.ForeignKey(
        Project, related_name="images", on_delete=models.CASCADE
    )
    image = models.ImageField(upload_to="projects/screenshots/")
    caption = models.CharField(max_length=200, blank=True)
    alt_text = models.CharField(
        max_length=200,
        blank=True,
        help_text="Description for screen readers. Falls back to the caption.",
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.project.title} — image {self.pk}"
