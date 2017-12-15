from django.conf.urls import url, include
from rest_framework.routers import DefaultRouter

from .views import *



router = DefaultRouter()
router.register(r'events',EventViewSet)

urlpatterns = [

    url(r'^', include(router.urls)), # just include all the pre-generated urls from DefaultRouter()

    # List/Create questions from session PK
    url(r'^session/(?P<session_pk>\d+)/questions/$', QuestionListCreate.as_view(), name='questions'),
    url(r'^session/(?P<session_pk>\d+)/questions/(?P<question_pk>\d+)/$', QuestionRetrieveUpdateDestroy.as_view(), name='question-detail'),
]