from django.shortcuts import render
from rest_framework import generics, status
from .models import Room
from .serlializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse


# Create your views here.
class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class GetRoom(APIView):
    lookup_word = "code"
    serializer_class = RoomSerializer

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_word)

        if code != None:
            room = Room.objects.filter(code=code)
            if len(room) > 0:
                data = RoomSerializer(room[0]).data
                data["isHost"] = self.request.session.session_key == room[0].host
                return Response(data, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"Room not found": "Invalid Room Code."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        return Response(
            {"Bad Request": "Room Code Missing"}, status=status.HTTP_400_BAD_REQUEST
        )


class JoinRoom(APIView):
    def post(self, request, format=None):
        lookup_word = "code"

        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        code = request.data.get(lookup_word)

        if code != None:
            roomset = Room.objects.filter(code=code)

            if len(roomset) > 0:
                room = roomset[0]
                self.request.session["room_code"] = code
                return Response({"Success": "Room Joined"}, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"Room Not Found": "Invalid Room Code"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        return Response(
            {"Bad Request": "Missing Code Parameter"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guests_can_pause = serializer.data.get("guests_can_pause")
            votes_to_skip = serializer.data.get("votes_to_skip")
            host = self.request.session.session_key
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.guests_can_pause = guests_can_pause
                room.votes_to_skip = votes_to_skip
                self.request.session["room_code"] = room.code
                room.save(update_fields=["votes_to_skip", "guests_can_pause"])
            else:
                room = Room(
                    host=host,
                    votes_to_skip=votes_to_skip,
                    guests_can_pause=guests_can_pause,
                )
                room.save()
                self.request.session["room_code"] = room.code

        return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)


class userInRoom(APIView):
    def get(self, request, formate=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        if "room_code" in self.request.session:
            data = {"code": self.request.session["room_code"]}
        else:
            data = {"code": None}

        return JsonResponse(data, status=status.HTTP_200_OK)


class leaveRoom(APIView):
    def post(self, request, format=None):
        if "room_code" in self.request.session:
            self.request.session.pop("room_code")
            host_id = self.request.session.session_key
            rooms = Room.objects.filter(host=host_id)
            if len(rooms) > 0:
                room = rooms[0]
                room.delete()
        return Response({"Success": "Request Fulfilled"}, status=status.HTTP_200_OK)


class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer

    def patch(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            votes_to_skip = serializer.data.get("votes_to_skip")
            guests_can_pause = serializer.data.get("guests_can_pause")
            code = serializer.data.get("code")

            roomset = Room.objects.filter(code=code)

            if not roomset.exists():
                return Response(
                    {"Invalid Code:": "Room Not Found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            else:
                room = roomset[0]
                host_id = self.request.session.session_key

                if host_id == room.host:
                    room.votes_to_skip = votes_to_skip
                    room.guests_can_pause = guests_can_pause
                    room.save(update_fields=["votes_to_skip", "guests_can_pause"])
                    return Response(
                        RoomSerializer(room).data, status=status.HTTP_200_OK
                    )
                else:
                    return Response(
                        {
                            "Invalid Request": "You are not authorised to make this request"
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )

        return Response(
            {"Bad Request": "Data is not valid!"}, status=status.HTTP_400_BAD_REQUEST
        )
