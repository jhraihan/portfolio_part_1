from rest_framework import serializers

from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    photo = serializers.SerializerMethodField()
    resume = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            "full_name",
            "display_name",
            "title",
            "location",
            "email",
            "tagline",
            "hero_intro",
            "availability",
            "about_short",
            "about_long",
            "photo",
            "resume",
            "github_url",
            "linkedin_url",
            "leetcode_url",
            "twitter_url",
            "meta_description",
        ]

    def _absolute(self, field):
        if not field:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(field.url) if request else field.url

    def get_photo(self, obj):
        return self._absolute(obj.photo)

    def get_resume(self, obj):
        return self._absolute(obj.resume)
