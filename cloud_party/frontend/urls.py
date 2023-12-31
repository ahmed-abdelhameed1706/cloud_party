from django.urls import path
from .views import index

app_name = "frontend"

urlpatterns = [
    path("", index, name=""),
    path("join-room", index),
    path("create-room", index),
    path("room/<str:roomCode>", index),
]
