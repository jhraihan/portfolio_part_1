import re

from rest_framework import serializers

from .models import ContactMessage

# Crude but effective spam signals for a low-traffic personal contact form.
SPAM_PATTERNS = [
    r"\b(viagra|cialis|casino|crypto\s*giveaway)\b",
    r"\b(seo\s+services|backlinks?|guest\s+post)\b",
    r"(https?://\S+){3,}",  # three or more links
]


class ContactMessageSerializer(serializers.ModelSerializer):
    """Validates and stores an inbound contact message.

    `website` is a honeypot: real users never see it, so anything that fills
    it in is a bot. Server-side metadata is set by the view, not the client.
    """

    website = serializers.CharField(
        required=False, allow_blank=True, write_only=True
    )

    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "subject", "message", "website", "created_at"]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "name": {"min_length": 2, "max_length": 120, "trim_whitespace": True},
            "subject": {"min_length": 3, "max_length": 200, "trim_whitespace": True},
        }

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Please enter your name.")
        if len(value) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters.")
        return value

    def validate_email(self, value):
        return value.strip().lower()

    def validate_subject(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Subject must be at least 3 characters.")
        return value

    def validate_message(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError(
                "Message must be at least 10 characters."
            )
        if len(value) > 5000:
            raise serializers.ValidationError(
                "Message must be under 5000 characters."
            )
        return value

    def validate(self, attrs):
        if attrs.pop("website", ""):
            # Honeypot tripped. Fail as a generic validation error so the bot
            # learns nothing about why.
            raise serializers.ValidationError(
                {"detail": "Submission could not be processed."}
            )

        haystack = f"{attrs.get('subject', '')} {attrs.get('message', '')}".lower()
        for pattern in SPAM_PATTERNS:
            if re.search(pattern, haystack, re.IGNORECASE):
                raise serializers.ValidationError(
                    {"detail": "Submission could not be processed."}
                )

        return attrs
