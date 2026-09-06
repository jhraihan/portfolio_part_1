from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Profile
from .serializers import ProfileSerializer


class ProfileView(APIView):
    """The site's single profile record."""

    permission_classes = [AllowAny]

    def get(self, request):
        profile = Profile.get_solo()
        if profile is None:
            return Response({})
        return Response(
            ProfileSerializer(profile, context={"request": request}).data
        )
