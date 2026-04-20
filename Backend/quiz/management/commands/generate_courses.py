import os
import json
import re
import logging
from django.conf import settings
import requests
from django.core.management.base import BaseCommand
from quiz.models import Quiz, Question, Answer, Course, User
from django.utils.timezone import now

logger = logging.getLogger(__name__)

COURSE_TOPICS = [
    "Forbidden Foods In Certain Religions",
    "Different Cultural Celebrations Around The World",
    "Different Religous Celebrations Around The World"
]

class Command(BaseCommand):
    help = "Generates courses and quizzes using GroqCloud + LLaMA-3"

    def handle(self, *args, **kwargs):
        try:
            admin_user = User.objects.get(pk=1)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR("Admin user with ID=1 does not exist. Create a user first"))
            return

        for course_topic in COURSE_TOPICS:
            course, created = Course.objects.get_or_create(
                title=course_topic,
                defaults={
                    "description": f"A course about {course_topic} to improve workplace inclusivity.",
                    "created_at": now(),
                    "created_by": admin_user,
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f"Created course: {course.title}"))
            else:
                self.stdout.write(self.style.WARNING(f"Course '{course.title}' already exists. Skipping creation."))

            for i in range(2):
                quiz = Quiz.objects.create(
                    course=course,
                    title=f"temporary title {i+1}",
                    description=f"A quiz for {course_topic}, part {i+1}"
                )
                self.stdout.write(self.style.WARNING(f"Created quiz: {quiz.title}"))

                success = self.generate_questions(quiz)
                if success:
                    self.stdout.write(self.style.SUCCESS(f"Added questions and updated title for {quiz.title}"))
                else:
                    self.stdout.write(self.style.ERROR(f"Failed to add questions for {quiz.title}"))

    def generate_questions(self, quiz):
        prompt = f"""
        You are a quiz generator.

        1. Create a short and interesting title for a quiz about "{quiz.course.title}".
        2. Then create 5 multiple-choice questions (1 correct + 3 wrong answers each).
        3. Every Quiz title must be unique!! Make sure this constraint is followed!!!

        Return ONLY valid JSON like:
        {{
            "quiz_title": "Religious Food Taboos",
            "questions": [
                {{
                    "question": "Which religion prohibits eating beef?",
                    "correct_answer": "Hinduism",
                    "wrong_answers": ["Islam", "Christianity", "Judaism"]
                }},
                ...
            ]
        }}

        only return the answers in JSON format, no need to comment anything. Just JSON!!
        """

        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": settings.GROQ_MODEL,
            "messages": [
                {"role": "system", "content": "You generate unique quiz titles and questions in strict JSON format."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 1000,
            "temperature": 0.7
        }

        try:
            response = requests.post(settings.GROQ_API_URL, headers=headers, json=payload)
            response.raise_for_status()
            response_content = response.json()["choices"][0]["message"]["content"].strip()

            json_match = re.search(r"{.*}", response_content, re.DOTALL)
            if not json_match:
                logger.error(f"Could not extract valid JSON from response for quiz '{quiz.title}': {response_content}")
                return False

            quiz_data = json.loads(json_match.group())

            # update the quiz title dynamically
            quiz.title = quiz_data.get("quiz_title", quiz.title)
            quiz.save()

            questions = quiz_data.get("questions", [])
            for q in questions:
                question = Question.objects.create(
                    quiz=quiz,
                    question_text=q.get("question", "No question provided")
                )
                Answer.objects.create(
                    question=question,
                    text=q.get("correct_answer", "No answer"),
                    is_correct=True
                )
                for wrong in q.get("wrong_answers", []):
                    Answer.objects.create(
                        question=question,
                        text=wrong,
                        is_correct=False
                    )

            return True

        except Exception as e:
            logger.error(f"Groq API error for quiz '{quiz.title}': {e}", exc_info=True)
            return False
