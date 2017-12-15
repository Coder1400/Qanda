from django.conf.urls import url, include
from django.contrib import admin
from django.contrib.auth import views as auth_views

from dashboard import urls as dash_urls
from core import urls as core_urls
from qanda import views
from qa import urls as qa_urls



urlpatterns = [

    url(r'^_admin/', admin.site.urls),


    # main Index landing page - "about"

    url(r'^$', views.Index.as_view(), name='index'),

    # All user authentication functions will begin with url "_account"

    url(r'^_accounts/login/', auth_views.LoginView.as_view(
        template_name = 'accounts/login.html',
        redirect_authenticated_user = True),
        name='login'),

    url(r'^_accounts/logout/', auth_views.LogoutView.as_view(), name='logout'),

    url(r'^_accounts/signup/', views.Signup.as_view(), name='signup'),

    # Urls for the dashboard side of the application - Users who are actually buying the product.

    url(r'^_dashboard/', include(dash_urls, namespace= "dashboard")),

    # Urls for core. The rest_framework namespace needs to be a root namespace so it will have
    # to live here

    url(r'^_core/', include(core_urls, namespace= "core")),
    url(r'^_api-auth/', include('rest_framework.urls', namespace='rest_framework')),


    # This will be the urls for the questioner side - another application
    url(r'^', include(qa_urls, namespace= "qa")),

]
