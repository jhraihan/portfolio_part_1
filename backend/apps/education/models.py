from django.db import models


class Education(models.Model):
    """An academic qualification.

    Result fields are optional and separately toggleable, so a CGPA can be
    recorded privately without appearing on the site.
    """

    degree = models.CharField(max_length=160)
    institution = models.CharField(max_length=160)
    field_of_study = models.CharField(max_length=160, blank=True)
    location = models.CharField(max_length=120, blank=True)

    start_year = models.PositiveIntegerField()
    end_year = models.PositiveIntegerField(
        null=True, blank=True, help_text="Expected graduation year. Blank if ongoing."
    )
    is_current = models.BooleanField(default=False)
    status_note = models.CharField(
        max_length=120,
        blank=True,
        help_text='e.g. "Final year" or "Expected December 2026".',
    )

    result = models.CharField(
        max_length=40, blank=True, help_text="CGPA or grade. Stored but not shown unless enabled below."
    )
    show_result = models.BooleanField(
        default=False, help_text="Display the result publicly."
    )

    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "-start_year"]
        verbose_name_plural = "Education"

    def __str__(self):
        return f"{self.degree} — {self.institution}"

    @property
    def date_range(self):
        end = self.end_year or "Present"
        return f"{self.start_year} — {end}"
