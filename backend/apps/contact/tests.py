from django.core.cache import cache
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from .models import ContactMessage

VALID_PAYLOAD = {
    "name": "Alex Recruiter",
    "email": "alex@example.com",
    "subject": "Backend engineer role",
    "message": "We are hiring and would like to talk about your experience.",
}


class ContactSubmissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("contact-create")
        # Throttle history lives in the cache and would otherwise carry over
        # between test methods, tripping the limit partway through the suite.
        cache.clear()

    def _post(self, payload):
        return self.client.post(self.url, payload, format="json")

    def test_valid_submission_is_stored(self):
        response = self._post(VALID_PAYLOAD)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ContactMessage.objects.count(), 1)

        message = ContactMessage.objects.first()
        self.assertEqual(message.name, "Alex Recruiter")
        self.assertFalse(message.is_read)

    def test_email_is_normalised_to_lowercase(self):
        self._post({**VALID_PAYLOAD, "email": "  Alex@Example.COM  "})
        self.assertEqual(ContactMessage.objects.first().email, "alex@example.com")

    def test_missing_fields_are_rejected(self):
        response = self._post({})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        for field in ["name", "email", "subject", "message"]:
            self.assertIn(field, response.data)
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_invalid_email_is_rejected(self):
        response = self._post({**VALID_PAYLOAD, "email": "not-an-email"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_short_message_is_rejected(self):
        response = self._post({**VALID_PAYLOAD, "message": "hi"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("message", response.data)

    def test_overlong_message_is_rejected(self):
        response = self._post({**VALID_PAYLOAD, "message": "x" * 5001})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("message", response.data)

    def test_honeypot_blocks_submission(self):
        response = self._post({**VALID_PAYLOAD, "website": "http://spam.example"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_spam_content_is_blocked(self):
        response = self._post(
            {**VALID_PAYLOAD, "message": "We offer cheap backlinks for your site."}
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_client_metadata_is_recorded(self):
        self.client.post(
            self.url,
            VALID_PAYLOAD,
            format="json",
            HTTP_USER_AGENT="TestAgent/1.0",
            REMOTE_ADDR="203.0.113.7",
        )

        message = ContactMessage.objects.first()
        self.assertEqual(message.ip_address, "203.0.113.7")
        self.assertEqual(message.user_agent, "TestAgent/1.0")

    def test_messages_are_not_readable_through_the_api(self):
        ContactMessage.objects.create(**VALID_PAYLOAD)

        self.assertEqual(
            self.client.get(self.url).status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def test_repeated_submissions_are_throttled(self):
        # The configured rate is 5/hour; the sixth must be refused.
        for index in range(5):
            response = self._post(
                {**VALID_PAYLOAD, "subject": f"Message number {index}"}
            )
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self._post({**VALID_PAYLOAD, "subject": "One too many"})

        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(ContactMessage.objects.count(), 5)
