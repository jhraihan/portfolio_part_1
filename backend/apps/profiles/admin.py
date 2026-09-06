from django.contrib import admin
from django.utils.html import format_html

from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ["display_name", "title", "location", "updated_at"]
    readonly_fields = ["photo_preview", "updated_at"]

    fieldsets = [
        (
            "Identity",
            {
                "fields": [
                    "full_name",
                    "display_name",
                    "title",
                    "location",
                    "email",
                ]
            },
        ),
        (
            "Hero",
            {"fields": ["tagline", "hero_intro", "availability"]},
        ),
        (
            "About",
            {"fields": ["about_short", "about_long"]},
        ),
        (
            "Media",
            {
                "description": (
                    "The resume download button stays hidden until a file is "
                    "uploaded here."
                ),
                "fields": ["photo", "photo_preview", "resume"],
            },
        ),
        (
            "Links",
            {
                "description": "Empty links are not rendered.",
                "fields": [
                    "github_url",
                    "linkedin_url",
                    "leetcode_url",
                    "twitter_url",
                ],
            },
        ),
        ("SEO", {"fields": ["meta_description"]}),
    ]

    @admin.display(description="Current photo")
    def photo_preview(self, obj):
        if obj.photo:
            return format_html(
                '<img src="{}" style="height:120px;border-radius:8px;" />',
                obj.photo.url,
            )
        return "No photo uploaded"

    def has_add_permission(self, request):
        # Singleton: block a second record from the admin as well as the model.
        return not Profile.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
