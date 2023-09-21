from django.shortcuts import render, redirect
from rest_framework.views import APIView
from .credentials import CLIENT_ID, CLIENT_SECRET, REDIRECT_URL
from requests import Request, post
from rest_framework.response import Response
from rest_framework import status
from .utils import (
    is_spotify_authenticated,
    execute_spotify_api_call,
    update_or_create_user_tokens,
    pauseSong,
    playSong,
    skipSong,
)
from api.models import Room
from .models import Vote


# Create your views here.
class AuthUrl(APIView):
    def get(self, request, format=None):
        scopes = "user-read-playback-state user-modify-playback-state user-read-currently-playing"

        url = (
            Request(
                "GET",
                "https://accounts.spotify.com/authorize",
                params={
                    "scope": scopes,
                    "response_type": "code",
                    "redirect_uri": REDIRECT_URL,
                    "client_id": CLIENT_ID,
                },
            )
            .prepare()
            .url
        )

        return Response({"url": url}, status=status.HTTP_200_OK)


def spotify_callback(request, format=None):
    code = request.GET.get("code")
    error = request.GET.get("error")

    respose = post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URL,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
    ).json()

    access_token = respose.get("access_token")
    token_type = respose.get("token_type")
    refresh_token = respose.get("refresh_token")
    expires_in = respose.get("expires_in")
    error = respose.get("error")

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(
        request.session.session_key, access_token, token_type, expires_in, refresh_token
    )

    return redirect("frontend:")


class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({"status": is_authenticated}, status=status.HTTP_200_OK)


class CurrentSong(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get("room_code")
        roomset = Room.objects.filter(code=room_code)
        if roomset.exists():
            room = roomset[0]
        else:
            return Response({}, status.HTTP_404_NOT_FOUND)

        endpoint = "player/currently-playing"
        host = room.host

        response = execute_spotify_api_call(host, endpoint)

        if "error" in response or "item" not in response:
            return Response({}, status.HTTP_204_NO_CONTENT)

        item = response.get("item")
        duration = item.get("duration_ms")
        progress = response.get("progress_ms")
        album_cover = item.get("album").get("images")[0].get("url")
        is_playing = response.get("is_playing")
        song_id = item.get("id")

        artist_string = ""

        for i, artist in enumerate(item.get("artists")):
            if i > 0:
                artist_string += ", "
            name = artist.get("name")
            artist_string += name

        votes = len(Vote.objects.filter(room=room, song_id=room.current_song))

        song = {
            "title": item.get("name"),
            "artist": artist_string,
            "duration": duration,
            "image_url": album_cover,
            "time": progress,
            "is_playing": is_playing,
            "votes": votes,
            "votes_required": room.votes_to_skip,
            "id": song_id,
        }

        self.update_room_song(room, song_id)
        return Response(song, status=status.HTTP_200_OK)

    def update_room_song(self, room, song_id):
        current_song = room.current_song

        if current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=["current_song"])
            Vote.objects.filter(room=room).delete()


class PauseSong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)[0]
        host = room.host
        if host == self.request.session.session_key or room.guests_can_pause:
            pauseSong(host)
            return Response({"Song State": "Paused"}, status=status.HTTP_200_OK)
        return Response(
            {"Invalid Request": "You are no Authorized to make that request"},
            status=status.HTTP_403_FORBIDDEN,
        )


class PlaySong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)[0]
        host = room.host
        if host == self.request.session.session_key or room.guests_can_pause:
            playSong(host)
            return Response({"Song State": "Playing"}, status=status.HTTP_200_OK)
        return Response(
            {"Invalid Request": "You are no Authorized to make that request"},
            status=status.HTTP_403_FORBIDDEN,
        )


class SkipSong(APIView):
    def post(self, request, format=None):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)[0]
        host = room.host
        votes = Vote.objects.filter(room=room, song_id=room.current_song)
        votes_needed = room.votes_to_skip
        if host == self.request.session.session_key or len(votes) == votes_needed:
            votes.delete()
            skipSong(host)
        else:
            vote = Vote(
                user=self.request.session.session_key,
                room=room,
                song_id=room.current_song,
            )
            vote.save()

        return Response({}, status=status.HTTP_204_NO_CONTENT)
