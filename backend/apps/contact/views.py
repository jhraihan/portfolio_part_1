import logging

from django.conf import settings
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import ContactMessage
from .serializers import ContactMessageSerializer

logger = logging.getLogger(__name__)


def _client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


class ContactCreateView(CreateAPIView):
    """Accepts a contact message.

    Write-only: submissions are stored and readable through the Django admin,
    never through the API. Throttled per the `contact` scope in settings.
    """

    permission_classes = [AllowAny]
    serializer_class = ContactMessageSerializer
    queryset = ContactMessage.objects.none()
    throttle_scope = "contact"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = serializer.save(
            ip_address=_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", "")[:300],
        )

        self._notify(message)

        return Response(
            {
                "detail": "Thanks for reaching out. I'll get back to you soon.",
                "id": message.id,
            },
            status=status.HTTP_201_CREATED,
        )

    def _notify(self, message):
        """Send an email notification when SMTP is configured.

        Delivery failure must never fail the request: the message is already
        stored, so the submission succeeded from the sender's perspective.
        """
        recipient = getattr(settings, "CONTACT_NOTIFY_EMAIL", "")
        if not recipient:
            return

        try:
            send_mail(
                subject=f"Portfolio contact: {message.subject}",
                message=(
                    f"From: {message.name} <{message.email}>\n"
                    f"Subject: {message.subject}\n\n"
                    f"{message.message}"
                ),
                from_email=settings.EMAIL_HOST_USER or recipient,
                recipient_list=[recipient],
                fail_silently=False,
            )
        except Exception:
            logger.exception("Contact notification email failed for id=%s", message.id)
