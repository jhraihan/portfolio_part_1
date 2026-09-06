from django.contrib import admin

from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "subject", "preview", "is_read", "created_at"]
    list_filter = ["is_read", "is_archived", "created_at"]
    search_fields = ["name", "email", "subject", "message"]
    readonly_fields = [
        "name",
        "email",
        "subject",
        "message",
        "ip_address",
        "user_agent",
        "created_at",
    ]
    date_hierarchy = "created_at"
    actions = ["mark_read", "mark_unread", "archive"]

    fieldsets = [
        ("Message", {"fields": ["name", "email", "subject", "message"]}),
        ("Status", {"fields": ["is_read", "is_archived"]}),
        (
            "Metadata",
            {
                "classes": ["collapse"],
                "fields": ["ip_address", "user_agent", "created_at"],
            },
        ),
    ]

    def has_add_permission(self, request):
        # Messages arrive through the form only.
        return False

    @admin.action(description="Mark selected as read")
    def mark_read(self, request, queryset):
        queryset.update(is_read=True)

    @admin.action(description="Mark selected as unread")
    def mark_unread(self, request, queryset):
        queryset.update(is_read=False)

    @admin.action(description="Archive selected")
    def archive(self, request, queryset):
        queryset.update(is_archived=True)
