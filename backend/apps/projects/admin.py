from django.contrib import admin
from django.utils.html import format_html

from .models import Project, ProjectFeature, ProjectImage, Technology


class ProjectFeatureInline(admin.TabularInline):
    model = ProjectFeature
    extra = 1
    fields = ["order", "title", "description"]
    ordering = ["order"]


class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 1
    fields = ["order", "image", "preview", "caption", "alt_text"]
    readonly_fields = ["preview"]
    ordering = ["order"]

    @admin.display(description="Preview")
    def preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="height:60px;border-radius:4px;" />', obj.image.url
            )
        return "—"


@admin.register(Technology)
class TechnologyAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "order", "project_count"]
    list_filter = ["category"]
    search_fields = ["name"]
    list_editable = ["order"]
    prepopulated_fields = {"slug": ("name",)}

    @admin.display(description="Projects")
    def project_count(self, obj):
        return obj.projects.count()


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "accent_label",
        "status",
        "is_featured",
        "order",
        "links_present",
        "media_present",
    ]
    list_filter = ["status", "is_featured", "project_type", "technologies"]
    list_editable = ["is_featured", "order"]
    search_fields = ["title", "subtitle", "summary"]
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ["technologies"]
    inlines = [ProjectFeatureInline, ProjectImageInline]

    fieldsets = [
        (
            "Identity",
            {
                "fields": [
                    "title",
                    "slug",
                    "subtitle",
                    "summary",
                    "accent_label",
                ]
            },
        ),
        (
            "Classification",
            {
                "fields": [
                    "project_type",
                    "status",
                    "is_solo",
                    "role",
                    "technologies",
                ]
            },
        ),
        (
            "Case study",
            {
                "description": (
                    "Any section left blank is hidden on the site rather than "
                    "shown empty."
                ),
                "fields": [
                    "problem",
                    "solution",
                    "architecture",
                    "challenges",
                    "lessons",
                ],
            },
        ),
        (
            "Links",
            {
                "description": (
                    "Buttons appear only when a URL is present. Add the live "
                    "demo and video links once they exist."
                ),
                "fields": ["github_url", "live_url", "video_url"],
            },
        ),
        ("Display", {"fields": ["cover_image", "is_featured", "order"]}),
    ]

    @admin.display(description="Links")
    def links_present(self, obj):
        parts = []
        if obj.github_url:
            parts.append("GitHub")
        if obj.live_url:
            parts.append("Live")
        return ", ".join(parts) or "—"

    @admin.display(description="Media")
    def media_present(self, obj):
        parts = []
        count = obj.images.count()
        if count:
            parts.append(f"{count} image{'s' if count != 1 else ''}")
        if obj.video_url:
            parts.append("video")
        return ", ".join(parts) or "—"
