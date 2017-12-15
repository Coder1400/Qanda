from django.conf.urls import url, include

from qa import views
from qa import speaker_urls, audience_urls

urlpatterns = [
    url(r'^lec/(?P<passcode>[\w\-]+)/', include(speaker_urls, namespace="lecturer")),
    url(r'^(?P<passcode>[\w\-]+)/', include(audience_urls, namespace="audience")),
]