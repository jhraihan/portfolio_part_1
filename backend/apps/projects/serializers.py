from rest_framework import serializers

from .models import Project, ProjectFeature, ProjectImage, Technology


class TechnologySerializer(serializers.ModelSerializer):
    class Meta:
        model = Technology
        fields = ["id", "name", "slug", "category"]


class ProjectFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectFeature
        fields = ["id", "title", "description"]


class ProjectImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    alt_text = serializers.SerializerMethodField()

    class Meta:
        model = ProjectImage
        fields = ["id", "image", "caption", "alt_text"]

    def get_image(self, obj):
        if not obj.image:
            return None
        request = self.context.get("request")
        url = obj.image.url
        return request.build_absolute_uri(url) if request else url

    def get_alt_text(self, obj):
        return obj.alt_text or obj.caption or f"{obj.project.title} screenshot"


class ProjectListSerializer(serializers.ModelSerializer):
    """Compact representation for project cards and the projects index."""

    technologies = TechnologySerializer(many=True, read_only=True)
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "slug",
            "subtitle",
            "summary",
            "project_type",
            "status",
            "accent_label",
            "technologies",
            "cover_image",
            "github_url",
            "live_url",
            "video_url",
            "is_featured",
            "order",
        ]

    def get_cover_image(self, obj):
        if not obj.cover_image:
            return None
        request = self.context.get("request")
        url = obj.cover_image.url
        return request.build_absolute_uri(url) if request else url


class ProjectDetailSerializer(ProjectListSerializer):
    """Full case study payload for a single project."""

    features = ProjectFeatureSerializer(many=True, read_only=True)
    images = ProjectImageSerializer(many=True, read_only=True)

    class Meta(ProjectListSerializer.Meta):
        fields = ProjectListSerializer.Meta.fields + [
            "is_solo",
            "role",
            "problem",
            "solution",
            "architecture",
            "challenges",
            "lessons",
            "features",
            "images",
        ]
