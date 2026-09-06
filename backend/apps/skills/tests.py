from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from .models import Skill, SkillCategory


class SkillOrderingTests(TestCase):
    """Skills surface strongest-first so a category never opens weak."""

    def setUp(self):
        self.client = APIClient()
        category = SkillCategory.objects.create(name="Backend")

        for name, level in [
            ("Familiar Thing", "familiar"),
            ("Core Thing", "core"),
            ("Working Thing", "working"),
            ("Strong Thing", "strong"),
        ]:
            Skill.objects.create(name=name, category=category, level=level)

    def test_skills_are_ordered_by_level(self):
        response = self.client.get(reverse("skill-category-list"))
        names = [s["name"] for s in response.data[0]["skills"]]

        self.assertEqual(
            names,
            ["Core Thing", "Strong Thing", "Working Thing", "Familiar Thing"],
        )

    def test_level_display_is_human_readable(self):
        response = self.client.get(reverse("skill-category-list"))
        skill = response.data[0]["skills"][0]

        self.assertEqual(skill["level"], "core")
        self.assertEqual(skill["level_display"], "Core")

    def test_no_numeric_proficiency_is_exposed(self):
        # Percentages imply a precision that does not exist.
        response = self.client.get(reverse("skill-category-list"))
        skill = response.data[0]["skills"][0]

        for forbidden in ["percentage", "percent", "score", "rating"]:
            self.assertNotIn(forbidden, skill)
