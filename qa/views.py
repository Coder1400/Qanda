from django.shortcuts import render, redirect, get_object_or_404
from django.views import generic

from core.models import Event, Session, Question

#main QA audience web app
class SessionList(generic.DetailView):
    model = Event
    slug_field = "passcode"
    slug_url_kwarg = "passcode"

class SessionDetail(generic.DetailView):
    model = Session

    def post(self, request, *args, **kwargs):
        passcode = kwargs.pop("passcode")
        pk = kwargs.pop("pk")
        content = request.POST['content']
        Question.objects.create(content = content, session = self.get_object())
        return redirect("qa:session-detail", passcode = passcode, pk = pk )