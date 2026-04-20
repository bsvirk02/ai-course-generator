from django.urls import re_path
from . import consumers

# React should absorb this in order to display the live time left until the deadline for the course is due
websocket_urlpatterns = [
    re_path(r"ws/assignments/(?P<user_id>[^/]+)/$", consumers.CourseDeadlineConsumer.as_asgi()),
    re_path(r"ws/leaderboards/$", consumers.LiveLeaderboardConsumer.as_asgi()),
]
