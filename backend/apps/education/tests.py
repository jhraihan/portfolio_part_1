from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from .models import Education


class EducationPrivacyTests(TestCase):
    """The stored result must never reach the API unless explicitly published."""

    def setUp(self):
        self.client = APIClient()
        self.education = Education.objects.create(
            degree="BSc in Computer Science and Engineering",
            institution="Test University",
            start_year=2022,
            end_year=2026,
            result="3.30",
            show_result=False,
        )

    def test_result_is_withheld_by_default(self):
        response = self.client.get(reverse("education-list"))

        self.assertIsNone(response.data[0]["result"])
        # Confirm it is stored, just not exposed.
        self.assertEqual(Education.objects.first().result, "3.30")

    def test_result_is_returned_once_published(self):
        self.education.show_result = True
        self.education.save()

        response = self.client.get(reverse("education-list"))
        self.assertEqual(response.data[0]["result"], "3.30")

    def test_result_never_appears_in_raw_response_body(self):
        response = self.client.get(reverse("education-list"))
        self.assertNotIn(b"3.30", response.content)

    def test_date_range_for_ongoing_study(self):
        Education.objects.all().delete()
        ongoing = Education.objects.create(
            degree="Ongoing", institution="Test", start_year=2022, end_year=None
        )
        self.assertEqual(ongoing.date_range, "2022 — Present")
