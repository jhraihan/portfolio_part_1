from django.db import models


class ContactMessage(models.Model):
    """A message submitted through the site's contact form.

    Messages are stored rather than emailed so nothing is lost if mail
    delivery is not configured. Email notification can be layered on later.
    """

    name = models.CharField(max_length=120)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()

    is_read = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)

    # Captured for abuse triage only; never exposed through the API.
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=300, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} — {self.subject}"

    @property
    def preview(self):
        return self.message[:80] + ("…" if len(self.message) > 80 else "")
