from django.db import models
import random
import string


def generate_room_code():
    while True:
        code = "".join(
            random.choices(
                string.ascii_uppercase + string.digits + string.ascii_lowercase, k=6
            )
        )
        if Room.objects.filter(code=code).count() == 0:
            break
    return code


class Room(models.Model):
    code = models.CharField(max_length=8, default=generate_room_code, unique=True)
    host = models.CharField(max_length=50, unique=True)
    guests_can_pause = models.BooleanField(null=False, default=False)
    votes_to_skip = models.IntegerField(null=False, default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    current_song = models.CharField(max_length=50, null=True)
