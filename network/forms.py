from django import forms
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

from .models import Followers

class CommentForm(forms.Form):
    comment = forms.CharField(max_length=1000, widget=forms.Textarea(attrs={"id": "new-post-text-area", "rows": 3}),
    label="", help_text="")

class FollowerForm(forms.Form):
    class Meta:
        model = Followers
        fields = '__all__'