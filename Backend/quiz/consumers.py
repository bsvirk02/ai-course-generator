import json
import asyncio
from datetime import timedelta
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone
from quiz.models import User, Group
from asgiref.sync import sync_to_async

class CourseDeadlineConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # gets the user ID from the url in routing.py
        self.user_id = self.scope['url_route']["kwargs"]["user_id"]
        print(f"[WebSocket] Connecting user_id = {self.user_id}")

        # accept the websocket connection
        await self.accept() 

        # starts sending deadline updates for a connected user
        self.send_task = asyncio.create_task(self.send_deadline_updates())

    async def disconnect(self, close_code):
        # cancels the websocket if a user leave the page with the live deadline
        self.send_task.cancel()
        print(f"[WebSocket] Disconnected: {self.user_id}, code={close_code}")

    async def send_deadline_updates(self):
        try:
            # while the user is on the same page displaying the deadline (when websocket is connected)
            while True:
                # gets the current user
                try:
                    user = await User.objects.aget(user_id=self.user_id)
                    print(f"[WebSocket] Found user: {user.name}, role: {user.role}")
                except User.DoesNotExist:
                    await self.send(text_data=json.dumps({"error": "User not found"}))
                    await self.close()
                    return

                # all users can see all groups
                groups = await asyncio.to_thread(lambda: list(
                    Group.objects.prefetch_related("groupcourseassignment_set", "groupcourseassignment_set__course").all()
                ))

                assignments_data = []

                # loop through every group and its course assignments
                for group in groups:
                    # use sync_to_async to avoid "cannot call from async context" error
                    assignments = await sync_to_async(list)(group.groupcourseassignment_set.all())
                    is_member = await sync_to_async(group.members.filter(id=user.id).exists)()
                    for assignment in assignments:
                        payload = {
                            "id": assignment.id,
                            "course_id": assignment.course.id,
                            "course": assignment.course.title,
                            "deadline": assignment.deadline.isoformat(),
                            "group_id": group.id,
                            "group_name": group.name,
                        }

                        # only managers and HR should see the live countdown and progress
                        if user.role in ["manager", "hr"] or is_member:
                            remaining = assignment.deadline - timezone.now()
                            total_seconds = max(int(remaining.total_seconds()), 0)

                            hours = total_seconds // 3600
                            minutes = (total_seconds % 3600) // 60
                            seconds = total_seconds % 60

                            payload["time_remaining"] = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
                            payload["progress"] = 0  # Placeholder — add actual progress logic if needed

                        # add the assignment payload to the list
                        assignments_data.append(payload)

                # send the data in a json format to the frontend so it can display the time remaining
                await self.send(text_data=json.dumps({"assignments": assignments_data}))
                print(f"[WebSocket] Sent deadline update: {assignments_data}")
                await asyncio.sleep(5)

        except asyncio.CancelledError:
            print("[WebSocket] Deadline task cancelled.")
        except Exception as e:
            print(f"[WebSocket Error] {e}")
            await self.close()

class LiveLeaderboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

        self.send_task =asyncio.create_task(self.send_leaderboard_updates())
    
    async def disconnect(self, close_code):
        self.send_task.cancel()

    async def send_leaderboard_updates(self):
        while True:
            top_ten_users = await asyncio.to_thread(lambda: list(User.objects.order_by('-points_count')[:10]))

            leaderboard = []
            for index, user in enumerate(top_ten_users):
                leaderboard.append({
                    "rank": index + 1,
                    "name": user.name,
                    "points": user.points_count,
                    "country": user.country,
                    "profile_picture": user.profile_picture.url if user.profile_picture else None
                })

            # Send the leaderboard data
            await self.send(text_data=json.dumps({"leaderboard": leaderboard}))

            # Update every 15 seconds
            await asyncio.sleep(5)
