from django.conf.urls import url, include

from qa import views

urlpatterns = [
    url(r'^$', views.SessionList.as_view(template_name="qa/lecturer/qa-main.html"), name='main'),
    url(r'^s/(?P<pk>\d+)/$', views.SessionDetail.as_view(template_name="qa/lecturer/session-detail.html"), name='session-detail'),
]