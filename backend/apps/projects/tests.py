from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from .models import Project, ProjectFeature, Technology


class ProjectModelTests(TestCase):
    def test_slug_is_generated_from_title(self):
        project = Project.objects.create(
            title="My Test Project", subtitle="A subtitle", summary="A summary."
        )
        self.assertEqual(project.slug, "my-test-project")

    def test_explicit_slug_is_preserved(self):
        project = Project.objects.create(
            title="My Test Project",
            slug="custom-slug",
            subtitle="A subtitle",
            summary="A summary.",
        )
        self.assertEqual(project.slug, "custom-slug")

    def test_has_case_study_reflects_content(self):
        project = Project.objects.create(
            title="Bare", subtitle="s", summary="s"
        )
        self.assertFalse(project.has_case_study)

        project.problem = "There was a problem."
        project.save()
        self.assertTrue(project.has_case_study)


class ProjectAPITests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.django = Technology.objects.create(name="Django", category="backend")
        cls.react = Technology.objects.create(name="React", category="frontend")

        cls.featured = Project.objects.create(
            title="Featured Project",
            subtitle="Subtitle",
            summary="Summary.",
            problem="The problem.",
            is_featured=True,
            order=1,
        )
        cls.featured.technologies.set([cls.django, cls.react])
        ProjectFeature.objects.create(
            project=cls.featured, title="A feature", order=0
        )

        cls.other = Project.objects.create(
            title="Other Project",
            subtitle="Subtitle",
            summary="Summary.",
            is_featured=False,
            order=2,
        )
        cls.other.technologies.set([cls.django])

    def setUp(self):
        self.client = APIClient()

    def test_list_returns_all_projects(self):
        response = self.client.get(reverse("project-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_respects_ordering(self):
        response = self.client.get(reverse("project-list"))
        self.assertEqual(response.data[0]["title"], "Featured Project")

    def test_featured_filter(self):
        response = self.client.get(reverse("project-list"), {"featured": "true"})

        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Featured Project")

    def test_technology_filter(self):
        response = self.client.get(reverse("project-list"), {"tech": "react"})

        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Featured Project")

    def test_technology_filter_with_no_matches(self):
        response = self.client.get(reverse("project-list"), {"tech": "nonexistent"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_detail_includes_case_study_fields(self):
        response = self.client.get(
            reverse("project-detail", kwargs={"slug": "featured-project"})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["problem"], "The problem.")
        self.assertEqual(len(response.data["features"]), 1)
        self.assertIn("architecture", response.data)

    def test_unknown_slug_returns_404(self):
        response = self.client.get(
            reverse("project-detail", kwargs={"slug": "does-not-exist"})
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_api_is_read_only(self):
        response = self.client.post(reverse("project-list"), {"title": "Injected"})

        self.assertIn(
            response.status_code,
            [status.HTTP_403_FORBIDDEN, status.HTTP_405_METHOD_NOT_ALLOWED],
        )
        self.assertEqual(Project.objects.count(), 2)

    def test_technologies_endpoint_excludes_unused(self):
        Technology.objects.create(name="Unused", category="tool")

        response = self.client.get(reverse("technology-list"))
        names = [t["name"] for t in response.data]

        self.assertIn("Django", names)
        self.assertNotIn("Unused", names)
