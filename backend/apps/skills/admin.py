from django.contrib import admin

from .models import CourseworkSubject, Skill, SkillCategory


class SkillInline(admin.TabularInline):
    model = Skill
    extra = 1
    fields = ["order", "name", "level", "note", "is_featured"]
    ordering = ["order"]


@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "order", "skill_count"]
    list_editable = ["order"]
    prepopulated_fields = {"slug": ("name",)}
    inlines = [SkillInline]

    @admin.display(description="Skills")
    def skill_count(self, obj):
        return obj.skills.count()


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "level", "is_featured", "order"]
    list_filter = ["category", "level", "is_featured"]
    list_editable = ["level", "is_featured", "order"]
    search_fields = ["name"]


@admin.register(CourseworkSubject)
class CourseworkSubjectAdmin(admin.ModelAdmin):
    list_display = ["name", "order"]
    list_editable = ["order"]
