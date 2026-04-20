# quiz/tests.py

# from typing import override
from unittest.mock import patch
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.test import APITestCase, APIRequestFactory, force_authenticate
from django.contrib.auth import get_user_model

from quiz.models import (
    Course, Quiz, Question, Answer,
    UserQuestionTracker, Group, GroupCourseAssignment
)
from quiz.serializers import (
    CreateCourseSerializer, GroupSerializer,
    GroupCourseAssignmentSerializer
)
from quiz.views import (
    CourseCreationView, CreateGroupView,
    GroupCourseAssignmentView, CoursesView,
    QuizView, LeaderboardView, HomeView, CulturalNews
)

User = get_user_model()


class TestModelsStrTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="mgr", password="pass", user_id="e1", name="Mgr", role="manager"
        )
        self.course = Course.objects.create(
            title="C1", description="Desc", created_by=self.user
        )
        self.quiz = Quiz.objects.create(
            course=self.course, title="Q1", description="Quiz 1"
        )
        self.question = Question.objects.create(
            quiz=self.quiz, question_text="Q?"
        )
        self.answer = Answer.objects.create(
            question=self.question, text="A1", is_correct=True
        )
        self.tracker = UserQuestionTracker.objects.create(
            user=self.user, question=self.question
        )
        self.group = Group.objects.create(
            name="G1", created_by=self.user
        )
        self.group.members.add(self.user)
        self.assignment = GroupCourseAssignment.objects.create(
            course=self.course,
            group=self.group,
            assigned_by=self.user,
            deadline=timezone.now() + timedelta(days=2)
        )

    def test_course_str(self):
        self.assertEqual(str(self.course), "C1")

    def test_quiz_str(self):
        self.assertEqual(str(self.quiz), "Q1")

    def test_question_str(self):
        self.assertEqual(str(self.question), "Q?")

    def test_answer_str(self):
        self.assertIn("A1", str(self.answer))

    def test_tracker_str(self):
        s = str(self.tracker)
        self.assertIn("Tracker for User", s)

    def test_group_str(self):
        self.assertIn("Group name: G1", str(self.group))

    def test_assignment_str(self):
        self.assertIn("G1", str(self.assignment))


# @override
class TestSerializerValidationTests(TestCase):
    def setUp(self):
        # set up a manager user
        self.user = User.objects.create_user(
            username="mgr2", password="pass", user_id="e2", name="Mgr2", role="manager"
        )
        # set up a course and a group for the deadline‐validation test
        self.course = Course.objects.create(
            title="C2", description="Desc", created_by=self.user
        )
        self.group = Group.objects.create(
            name="G2", created_by=self.user
        )
        self.group.members.add(self.user)

    def make_q_block(self, correct_idx=0):
        answers = []
        for i in range(4):
            answers.append({
                "text": f"opt{i}",
                "is_correct": (i == correct_idx)
            })
        return {"question_text": "Q?", "answers": answers}

    def test_create_course_too_few_questions(self):
        payload = {
            "title": "C2",
            "description": "Desc",
            "quizzes": [{
                "title": "QZ",
                "description": "D",
                "questions": [self.make_q_block() for _ in range(3)]
            }]
        }
        ser = CreateCourseSerializer(data=payload)
        with self.assertRaises(Exception) as cm:
            ser.is_valid(raise_exception=True)
        self.assertIn("at least 5 questions", str(cm.exception))

    def test_create_course_bad_answers(self):
        q = {"question_text": "Q?", "answers": [
            {"text": "a", "is_correct": True},
            {"text": "b", "is_correct": False},
            {"text": "c", "is_correct": False},
        ]}
        payload = {
            "title": "C3",
            "description": "Desc",
            "quizzes": [{
                "title": "QZ",
                "description": "D",
                "questions": [q] * 5
            }]
        }
        ser = CreateCourseSerializer(data=payload)
        ser.is_valid()
        self.assertIn("4 options", str(ser.errors))

    def test_group_serializer_assigns_members(self):
        emp = User.objects.create_user(
            username="emp", password="pass", user_id="e3", name="Emp", role="employee"
        )
        data = {"name": "Team1", "members": [emp.id]}
        ser = GroupSerializer(data=data)
        self.assertTrue(ser.is_valid(), ser.errors)
        grp = ser.save(created_by=self.user)
        self.assertEqual(grp.members.count(), 1)
        self.assertEqual(grp.created_by, self.user)

    def test_assignment_deadline_validation(self):
        past = timezone.now() - timedelta(hours=1)
        data = {
            "course": self.course.id,
            "group": self.group.id,
            "deadline": past
        }
        ser = GroupCourseAssignmentSerializer(data=data)
        with self.assertRaises(Exception) as cm:
            ser.is_valid(raise_exception=True)
        self.assertIn("Deadline must be in the future", str(cm.exception))


# @override
class TestViewTests(APITestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        # three roles
        self.emp = User.objects.create_user(
            username="e", password="pass", user_id="e1", name="E", role="employee"
        )
        self.hr = User.objects.create_user(
            username="h", password="pass", user_id="e2", name="H", role="hr"
        )
        self.mgr = User.objects.create_user(
            username="m", password="pass", user_id="e3", name="M", role="manager"
        )

        # prepare course payload
        self.course_payload = {
            "title": "CX",
            "description": "DX",
            "quizzes": []
        }

        # prepare group payload
        self.group_payload = {"name": "GZ", "members": []}

        # prepare assignment payload
        self.assign_payload = {
            "course": 1,
            "group": 1,
            "deadline": (timezone.now() + timedelta(days=1)).isoformat()
        }

    def test_home_requires_auth(self):
        view = HomeView.as_view()
        req = self.factory.get("/api/home/")
        resp = view(req)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_course_forbidden_for_employee(self):
        view = CourseCreationView.as_view()
        req = self.factory.post("/api/create_course/", self.course_payload, format='json')
        force_authenticate(req, user=self.emp)
        resp = view(req)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_course_allowed_for_hr_and_manager(self):
        view = CourseCreationView.as_view()
        for user in (self.hr, self.mgr):
            req = self.factory.post("/api/create_course/", self.course_payload, format='json')
            force_authenticate(req, user=user)
            resp = view(req)
            self.assertNotEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_group_creation_forbidden_for_non_manager(self):
        view = CreateGroupView.as_view()
        req = self.factory.post("/api/assign_groups/", self.group_payload, format='json')
        force_authenticate(req, user=self.hr)
        resp = view(req)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_group_creation_allowed_for_manager(self):
        view = CreateGroupView.as_view()
        req = self.factory.post("/api/assign_groups/", self.group_payload, format='json')
        force_authenticate(req, user=self.mgr)
        resp = view(req)
        self.assertNotEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_assignment_forbidden_for_non_manager(self):
        view = GroupCourseAssignmentView.as_view()
        req = self.factory.post("/api/assign_group_courses/", self.assign_payload, format='json')
        force_authenticate(req, user=self.hr)
        resp = view(req)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_assignment_allowed_for_manager(self):
        view = GroupCourseAssignmentView.as_view()
        req = self.factory.post("/api/assign_group_courses/", self.assign_payload, format='json')
        force_authenticate(req, user=self.mgr)
        resp = view(req)
        self.assertNotEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_courses(self):
        view = CoursesView.as_view()
        req = self.factory.get("/api/courses/")
        force_authenticate(req, user=self.mgr)
        resp = view(req)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_quiz_view_not_found(self):
        view = QuizView.as_view()
        req = self.factory.get("/api/quiz/999/")
        force_authenticate(req, user=self.mgr)
        resp = view(req, quiz_id=999)
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_leaderboard_view(self):
        User.objects.create_user(
            username="u1", password="p", user_id="e4", name="A", points_count=5
        )
        User.objects.create_user(
            username="u2", password="p", user_id="e5", name="B", points_count=10
        )
        view = LeaderboardView.as_view()
        req = self.factory.get("/api/leaderboard/")
        force_authenticate(req, user=self.mgr)
        resp = view(req)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.data.get("leaderboard", [])
        self.assertTrue(len(data) >= 2)
        self.assertEqual(data[0]["points"], 10)

class TestCulturalNewsTests(APITestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        # create an authenticated user
        self.user = User.objects.create_user(
            username="mgr", password="pass", user_id="u1", name="Tester", role="hr"
        )

    def test_cultural_news_requires_auth(self):
        view = CulturalNews.as_view()
        req = self.factory.get("/api/cultural_news/")
        resp = view(req)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    @patch("quiz.views.requests.get")
    def test_cultural_news_success(self, mock_get):
        # stub out the NewsAPI response
        fake_articles = [
            {"title": "Inclusion at Work", "url": "https://..."},
            {"title": "Diversity Trends", "url": "https://..."}
        ]
        mock_resp = mock_get.return_value
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"articles": fake_articles}

        view = CulturalNews.as_view()
        req = self.factory.get("/api/cultural_news/")
        force_authenticate(req, user=self.user)

        resp = view(req)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("articles", resp.data)
        self.assertEqual(resp.data["articles"], fake_articles)

    @patch("quiz.views.requests.get")
    def test_cultural_news_api_error(self, mock_get):
        # simulate NewsAPI returning an error message
        mock_resp = mock_get.return_value
        mock_resp.status_code = 401
        mock_resp.json.return_value = {"message": "Invalid API key"}

        view = CulturalNews.as_view()
        req = self.factory.get("/api/cultural_news/")
        force_authenticate(req, user=self.user)

        resp = view(req)
        self.assertEqual(resp.status_code, 401)
        self.assertIn("error", resp.data)
        self.assertEqual(resp.data["error"], "Invalid API key")
