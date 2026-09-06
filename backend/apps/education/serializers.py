from rest_framework import serializers

from .models import Education


class EducationSerializer(serializers.ModelSerializer):
    date_range = serializers.CharField(read_only=True)
    result = serializers.SerializerMethodField()

    class Meta:
        model = Education
        fields = [
            "id",
            "degree",
            "institution",
            "field_of_study",
            "location",
            "start_year",
            "end_year",
            "is_current",
            "status_note",
            "date_range",
            "result",
            "description",
        ]

    def get_result(self, obj):
        # Withheld unless explicitly published, so a stored CGPA never leaks.
        return obj.result if obj.show_result else None
