# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import redirect
from django.views import generic
from django.urls import reverse_lazy
from django.contrib.auth import login

from .forms import *

# Main index about page
class Index(generic.TemplateView):
    template_name = "qanda/index.html"


# _accounts view for signup
class Signup(generic.CreateView):
    form_class = UserCreationForm
    template_name = 'accounts/signup.html'
    success_url = reverse_lazy('dashboard:home')

    def form_valid(self, form):
        user = form.save()
        print(user)
        login(self.request, user)
        return redirect(self.success_url)
