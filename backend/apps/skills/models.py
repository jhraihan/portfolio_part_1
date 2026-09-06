from django.db import models
from django.utils.text import slugify


class SkillCategory(models.Model):
    """A grouping such as Languages, Backend, or Databases."""

    name = models.CharField(max_length=60, unique=True)
    slug = models.SlugField(max_length=60, unique=True, blank=True)
    description = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]
        verbose_name_plural = "Skill categories"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        return super().save(*args, **kwargs)


class Skill(models.Model):
    """A single technology and an honest proficiency level.

    Levels are named rather than numeric on purpose. Percentage bars imply a
    precision that does not exist and invite comparison the owner cannot win.
    """

    LEVEL_CHOICES = [
        ("core", "Core"),
        ("strong", "Strong"),
        ("working", "Working Knowledge"),
        ("familiar", "Familiar"),
        ("learning", "Currently Learning"),
        ("exploring", "Exploring"),
    ]

    # Ordering weight so the strongest skills surface first.
    LEVEL_WEIGHT = {
        "core": 0,
        "strong": 1,
        "working": 2,
        "familiar": 3,
        "learning": 4,
        "exploring": 5,
    }

    name = models.CharField(max_length=60)
    category = models.ForeignKey(
        SkillCategory, related_name="skills", on_delete=models.CASCADE
    )
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default="working")
    note = models.CharField(
        max_length=200, blank=True, help_text="Optional short context."
    )
    is_featured = models.BooleanField(
        default=False, help_text="Featured skills are highlighted on the home page."
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]
        unique_together = [["name", "category"]]

    def __str__(self):
        return f"{self.name} ({self.get_level_display()})"

    @property
    def level_weight(self):
        return self.LEVEL_WEIGHT.get(self.level, 9)


class CourseworkSubject(models.Model):
    """A studied academic subject, listed without a proficiency claim."""

    name = models.CharField(max_length=100, unique=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]
        verbose_name = "Coursework subject"

    def __str__(self):
        return self.name
