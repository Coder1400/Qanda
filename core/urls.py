from django.conf.urls import url, include

from core.api import urls as api_urls



# The API URLs are now determined automatically by the router.
# Additionally, we include the login URLs for the browsable API.
urlpatterns = [
    url(r'^api/', include(api_urls, namespace= "api"))
]