from django.db.models import Prefetch
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import Project, ProjectFeature, ProjectImage, Technology
from .serializers import (
    ProjectDetailSerializer,
    ProjectListSerializer,
    TechnologySerializer,
)


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    """Public, read-only project list and case study detail.

    Filter by technology slug:  /api/projects/?tech=django
    Featured only:              /api/projects/?featured=true
    """

    permission_classes = [AllowAny]
    lookup_field = "slug"
    pagination_class = None

    def get_queryset(self):
        queryset = (
            Project.objects.all()
            .prefetch_related("technologies")
            .order_by("order", "-created_at")
        )

        if self.action == "retrieve":
            queryset = queryset.prefetch_related(
                Prefetch(
                    "features", queryset=ProjectFeature.objects.order_by("order", "id")
                ),
                Prefetch(
                    "images",
                    queryset=ProjectImage.objects.select_related("project").order_by(
                        "order", "id"
                    ),
                ),
            )

        tech = self.request.query_params.get("tech")
        if tech:
            queryset = queryset.filter(technologies__slug=tech).distinct()

        featured = self.request.query_params.get("featured")
        if featured is not None and featured.lower() in {"1", "true", "yes"}:
            queryset = queryset.filter(is_featured=True)

        return queryset

    def get_serializer_class(self):
        return (
            ProjectDetailSerializer
            if self.action == "retrieve"
            else ProjectListSerializer
        )


class TechnologyViewSet(viewsets.ReadOnlyModelViewSet):
    """Technologies that are attached to at least one project."""

    permission_classes = [AllowAny]
    serializer_class = TechnologySerializer
    lookup_field = "slug"
    pagination_class = None

    def get_queryset(self):
        return Technology.objects.filter(projects__isnull=False).distinct().order_by(
            "order", "name"
        )
