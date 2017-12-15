# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.views.generic import TemplateView, DetailView

from core.models import Event

from braces.views import LoginRequiredMixin


class Home(LoginRequiredMixin, TemplateView):
    template_name = "dashboard/dashboard.html"

class EventDetail(LoginRequiredMixin, DetailView):
    template_name = "dashboard/event-detail.html"
    model = Event
