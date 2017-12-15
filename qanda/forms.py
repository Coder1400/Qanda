from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.auth import forms

from core.models import User


# Override base UserCreationForm to accomodate custom user model

class UserCreationForm(forms.UserCreationForm):
    class Meta:
        model = User
        fields = ("username",)

    def clean_username(self):
        username = self.cleaned_data['username']
        return username.lower()
