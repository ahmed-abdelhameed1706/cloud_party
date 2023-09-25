from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("party/admin/", admin.site.urls),
    path("party/api/", include("api.urls")),
    path("party/", include("frontend.urls")),
    path("party/spotify/", include("spotify.urls")),
]
