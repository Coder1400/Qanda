from django.conf.urls import url, include

from qa import views

urlpatterns = [

    # Url routes for audience
    url(r'^$', views.SessionList.as_view(template_name="qa/audience/qa-main.html"), name='main'),
    url(r'^s/(?P<pk>\d+)/$', views.SessionDetail.as_view(template_name="qa/audience/session-detail.html"), name='session-detail'),
]