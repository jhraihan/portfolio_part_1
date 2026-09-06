from django.contrib import admin

from .models import Education


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = [
        "degree",
        "institution",
        "date_range",
        "is_current",
        "show_result",
        "order",
    ]
    list_editable = ["order"]
    list_filter = ["is_current"]

    fieldsets = [
        (
            "Qualification",
            {"fields": ["degree", "institution", "field_of_study", "location"]},
        ),
        (
            "Dates",
            {"fields": ["start_year", "end_year", "is_current", "status_note"]},
        ),
        (
            "Result",
            {
                "description": (
                    "The result is stored privately and only published when "
                    "'show result' is enabled."
                ),
                "fields": ["result", "show_result"],
            },
        ),
        ("Other", {"fields": ["description", "order"]}),
    ]
