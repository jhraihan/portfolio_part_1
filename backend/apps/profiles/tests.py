from django.core.exceptions import ValidationError
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from .models import Profile

PROFILE_DATA = {
    "full_name": "Test Person",
    "display_name": "Test Person",
    "title": "Software Engineer",
    "email": "test@example.com",
}


class ProfileSingletonTests(TestCase):
    def test_second_profile_is_rejected(self):
        Profile.objects.create(**PROFILE_DATA)

        with self.assertRaises(ValidationError):
            Profile.objects.create(**PROFILE_DATA)

        self.assertEqual(Profile.objects.count(), 1)

    def test_existing_profile_can_still_be_updated(self):
        profile = Profile.objects.create(**PROFILE_DATA)
        profile.title = "Backend Engineer"
        profile.save()

        self.assertEqual(Profile.objects.get(pk=profile.pk).title, "Backend Engineer")


class ProfileAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("profile")

    def test_returns_empty_object_when_no_profile_exists(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {})

    def test_returns_profile_fields(self):
        Profile.objects.create(**PROFILE_DATA)

        response = self.client.get(self.url)
        self.assertEqual(response.data["display_name"], "Test Person")
        self.assertIsNone(response.data["resume"])

    def test_api_is_read_only(self):
        Profile.objects.create(**PROFILE_DATA)

        response = self.client.post(self.url, {"title": "Injected"})
        self.assertEqual(response.status_code, 405)
