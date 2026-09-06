"""Public API routes. Everything is read-only except contact submission."""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.contact.views import ContactCreateView
from apps.education.views import EducationViewSet
from apps.profiles.views import ProfileView
from apps.projects.views import ProjectViewSet, TechnologyViewSet
from apps.skills.views import CourseworkViewSet, SkillCategoryViewSet

router = DefaultRouter()
router.register("projects", ProjectViewSet, basename="project")
router.register("technologies", TechnologyViewSet, basename="technology")
router.register("skills", SkillCategoryViewSet, basename="skill-category")
router.register("coursework", CourseworkViewSet, basename="coursework")
router.register("education", EducationViewSet, basename="education")

urlpatterns = [
    path("profile/", ProfileView.as_view(), name="profile"),
    path("contact/", ContactCreateView.as_view(), name="contact-create"),
    path("", include(router.urls)),
]
