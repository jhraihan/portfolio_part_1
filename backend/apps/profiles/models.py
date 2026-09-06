from django.core.exceptions import ValidationError
from django.db import models


class Profile(models.Model):
    """Site owner identity, hero copy, and social links.

    A singleton: the site renders exactly one profile. save() enforces this
    rather than relying on the admin to behave.
    """

    # Identity
    full_name = models.CharField(max_length=120)
    display_name = models.CharField(
        max_length=120, help_text="Name shown in the hero and browser tab."
    )
    title = models.CharField(
        max_length=120, help_text='Professional title, e.g. "Software Engineer".'
    )
    location = models.CharField(max_length=120, blank=True)
    email = models.EmailField(help_text="Public contact address.")

    # Hero
    tagline = models.CharField(
        max_length=200,
        blank=True,
        help_text="Short line under the name in the hero.",
    )
    hero_intro = models.TextField(
        blank=True, help_text="One or two sentences in the hero."
    )
    availability = models.CharField(
        max_length=160,
        blank=True,
        help_text='e.g. "Open to remote, hybrid, and onsite roles". Hidden when empty.',
    )

    # About
    about_short = models.TextField(
        blank=True, help_text="Condensed about text for the home page."
    )
    about_long = models.TextField(
        blank=True, help_text="Full about text for the about page. Blank lines separate paragraphs."
    )

    # Media
    photo = models.ImageField(upload_to="profile/", blank=True, null=True)
    resume = models.FileField(
        upload_to="resume/",
        blank=True,
        null=True,
        help_text="PDF resume. The download button is hidden while this is empty.",
    )

    # Links. Each is optional; the frontend renders only what is filled in.
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    leetcode_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)

    # SEO
    meta_description = models.CharField(
        max_length=180,
        blank=True,
        help_text="Search result and social preview description.",
    )

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Profile"
        verbose_name_plural = "Profile"

    def __str__(self):
        return self.display_name

    def save(self, *args, **kwargs):
        if not self.pk and Profile.objects.exists():
            raise ValidationError(
                "Only one Profile may exist. Edit the existing one instead."
            )
        return super().save(*args, **kwargs)

    @classmethod
    def get_solo(cls):
        return cls.objects.first()
