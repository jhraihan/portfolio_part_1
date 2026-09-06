from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import CourseworkSubject, SkillCategory
from .serializers import CourseworkSubjectSerializer, SkillCategorySerializer


class SkillCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Skill categories with their nested skills."""

    permission_classes = [AllowAny]
    serializer_class = SkillCategorySerializer
    lookup_field = "slug"
    pagination_class = None
    queryset = (
        SkillCategory.objects.prefetch_related("skills")
        .order_by("order", "name")
    )


class CourseworkViewSet(viewsets.ReadOnlyModelViewSet):
    """Academic subjects studied, listed without proficiency claims."""

    permission_classes = [AllowAny]
    serializer_class = CourseworkSubjectSerializer
    pagination_class = None
    queryset = CourseworkSubject.objects.order_by("order", "name")
