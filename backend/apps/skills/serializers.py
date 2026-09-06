from rest_framework import serializers

from .models import CourseworkSubject, Skill, SkillCategory


class SkillSerializer(serializers.ModelSerializer):
    level_display = serializers.CharField(source="get_level_display", read_only=True)

    class Meta:
        model = Skill
        fields = ["id", "name", "level", "level_display", "note", "is_featured"]


class SkillCategorySerializer(serializers.ModelSerializer):
    skills = serializers.SerializerMethodField()

    class Meta:
        model = SkillCategory
        fields = ["id", "name", "slug", "description", "skills"]

    def get_skills(self, obj):
        # Strongest first, so a category never opens on a weak claim.
        skills = sorted(obj.skills.all(), key=lambda s: (s.level_weight, s.order, s.name))
        return SkillSerializer(skills, many=True, context=self.context).data


class CourseworkSubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseworkSubject
        fields = ["id", "name"]
