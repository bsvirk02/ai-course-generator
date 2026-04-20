import datetime
from django.conf import settings
from django.db import models, transaction
from django.utils import timezone
from django.utils.timezone import now
from django.contrib.auth.models import AbstractUser
import datetime

class Course(models.Model):
    title = models.CharField(max_length=256)
    description = models.TextField()
    created_at = models.DateTimeField(default=now, null=False, blank=False)
    created_by = models.ForeignKey("quiz.User", on_delete=models.CASCADE, related_name="created_courses")

    def __str__(self):
        return self.title

class User(AbstractUser):
    ROLE_CHOICES = [
        ("employee", "Employee"),
        ("hr", "HR"),
        ("manager", "Manager"),
    ]
    # abstract user so it already has fields like username, first_name, last_name email etc so we don't need to write it again
    user_id = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    points_count = models.IntegerField(default=0)
    country = models.CharField(max_length=100, blank=True, null=True)
    current_streak = models.IntegerField(default=0)
    ATH_streak = models.IntegerField(default=0)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True, default="profile_pics/IMG_1303.png")
    ethnicity = models.CharField(max_length=100, blank=True, null=True)
    sexuality = models.CharField(max_length=100, blank=True, null=True)
    religion = models.CharField(max_length=100, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="manager")

    def __str__(self):
        return f"{self.name} ({self.points_count} pts, Role: {self.role})"

    
class Quiz(models.Model):
    """
    A quiz containing multiple questions. 

    Fields:
        title (CharField): Quiz name
        description (TextField): A short description on what the quiz is going to be on
        date_created (DateTimeField): Exact date and time the quiz was made.
    """
    course = models.ForeignKey("Course", on_delete=models.CASCADE, related_name="quizzes")
    title = models.CharField(max_length=256, unique=True)
    description = models.TextField(blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date_created"] # Keeps the quizzes made in order of newest first
        verbose_name_plural = "Quizzes" # Now it should appear as "Quizzes" instead of "Quizs"

    def __str__(self):
        return self.title

    def get_question_trackers_due(self, user):
        return UserQuestionTracker.objects.filter(question__quiz=self,
                                                  user=user,
                                                  next_review_date__lte=timezone.now())


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE) 
    question_text = models.TextField()

    class Meta:
        ordering = ["-id"] # Keeps the questions in order of newest first

    def __str__(self):
        return self.question_text
    

class Answer(models.Model):
    """
    Represents an answer option for a question in a quiz.

    Fields:
        question (ForeignKey): Question that the answer belongs to 
        text (CharField): The answer text 
        is_correct (BooleanField): Indicates whether this answer is the correct one
    """
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="answers")
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    class Meta:
        ordering = ["-id"] # Keeps answers in order of newest first

    def __str__(self):
       return f"{self.text} ({'Correct' if self.is_correct else 'Wrong'})"
    



# UserQuestionTracker Model:
class UserQuestionTracker(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)

    # I’ve used the following article as a reference.
    # https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
    # ― Noah
    
    consecutive_correct_responses_n = models.IntegerField(default=0)
    easiness_factor = models.FloatField(default=2.5)
    current_interval_length = models.IntegerField(default=0)
    next_review_date = models.DateField(auto_now_add=True)

    attempt_count = models.IntegerField(default=0)  # only used for record-keeping

    @transaction.atomic
    def update(self, response_quality):
        if response_quality > 7:
            raise ValueError("A response quality greater than 7 does not make sense.")
        
        self.attempt_count += 1
        
        self.easiness_factor += -0.8 + 0.28*response_quality - 0.02*response_quality**2
        self.easiness_factor = max(self.easiness_factor, 1.3)

        if response_quality < 3:
            self.consecutive_correct_responses_n = 0
            self.current_interval_length = 0
            self.next_review_date = datetime.date.today()
        else:
            if self.consecutive_correct_responses_n == 0:
                pass
            elif self.consecutive_correct_responses_n == 1:
                self.current_interval_length = 1
            elif self.consecutive_correct_responses_n == 2:
                self.current_interval_length = 6
            else:
                self.current_interval_length *= self.easiness_factor

            self.consecutive_correct_responses_n += 1

            self.next_review_date += datetime.timedelta(days=self.current_interval_length)

        self.save()

    def __str__(self):
        return f"Tracker for User: {self.user.name}, Question: {self.question.question_text}"


class QuizWithQuestionTrackersDue:
    def __init__(self, quiz, question_trackers):
        self.quiz = quiz
        self.question_trackers = question_trackers

    
# UserCourseProgress Model:
class UserCourseProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Links to the User
    course = models.ForeignKey('Course', on_delete=models.CASCADE)  # Links to the Course
    lessons_total = models.IntegerField()  # Total number of lessons (calculated based on the Course)
    lessons_complete = models.IntegerField(default=0)  # Tracks the number of completed lessons
    course_completion_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)  # Percentage of course completed

#     # Add the UserCourseProgress ID field
#     # progress_id = models.AutoField(primary_key=True)  # Automatically generated unique ID for each progress entry

    def __str__(self):
        return f"Progress for User: {self.user.name}, Course: {self.course.course_title}"

class Group(models.Model):
    """This model is for when a manager want to create a group"""
    name = models.CharField(max_length=100)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_groups")
    members = models.ManyToManyField(User,related_name="group_course")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Group name: {self.name} created by {self.created_by}"


class GroupCourseAssignment(models.Model):
    """This model is for when a managaer is assigning courses for his employees to do"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="courses_due")
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    assigned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="assigned_by")
    deadline = models.DateTimeField()
    assigned_at = models.DateTimeField(default=now)

    def __str__(self):
        return f"{self.course.title} given to group {self.group.name} due at {self.deadline}"


