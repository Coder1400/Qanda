from django.conf.urls import url
from dashboard import views


urlpatterns = [

    url(r'^$', views.Home.as_view(), name='home'),
    url(r'^(?P<pk>\d+)/$', views.EventDetail.as_view(), name='event-detail-html'),
]
