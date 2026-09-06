from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import Education
from .serializers import EducationSerializer


class EducationViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = EducationSerializer
    pagination_class = None
    queryset = Education.objects.order_by("order", "-start_year")
