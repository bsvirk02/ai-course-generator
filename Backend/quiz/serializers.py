from django.utils import timezone 
from rest_framework import serializers
from django.db import transaction
from .models import Group, Quiz, Question, Answer, User, UserQuestionTracker, Course, GroupCourseAssignment

class UpdateUserProfileSerializer(serializers.ModelSerializer):
    role = serializers.CharField(read_only=True)
    points = serializers.IntegerField(source='points_count', read_only=True)
    profilePic = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "name",
            "role",
            "points",
            "country",
            "profilePic",
            "ethnicity",
            "sexuality",
            "religion",
            "bio",
            "profile_picture", 
        ]
        extra_kwargs = {
            "profile_picture": {"write_only": True, "required": False},
        }
    def get_profilePic(self, obj):
        request = self.context.get("request")
        if obj.profile_picture and hasattr(obj.profile_picture, "url"):
            return request.build_absolute_uri(obj.profile_picture.url)
        return None
    
class ViewOtherUsersSerializer(serializers.ModelSerializer):
    profilePic = serializers.SerializerMethodField()
    points = serializers.IntegerField(source='points_count', read_only=True)  # Add this line

    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "country",
            "profilePic",
            "bio",
            "ethnicity",
            "religion",
            "role",
            "points",  # Add this field
        ]

    def get_profilePic(self, obj):
        request = self.context.get("request")
        if obj.profile_picture and hasattr(obj.profile_picture, "url"):
            return request.build_absolute_uri(obj.profile_picture.url)
        return None


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'text', 'is_correct']


class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for the Question model. """

    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'question_text', 'answers']


class QuizSerializer(serializers.ModelSerializer):
    """Serializer for the Quiz model which has the questions as well."""

    questions = QuestionSerializer(many=True, read_only=True, source='question_set')

    class Meta: 
        model = Quiz
        fields = ['id', 'title', 'description', 'questions', 'date_created']


class MinimalQuizSerializer(serializers.ModelSerializer):
    """Serializer for the Quiz model that does not handle its questions."""

    class Meta: 
        model = Quiz
        fields = ['id', 'title', 'description', 'date_created']


class UserQuestionTrackerSerializer(serializers.ModelSerializer):
    question = QuestionSerializer()

    class Meta:
        model = UserQuestionTracker
        fields = ["question", "next_review_date"]


class QuizWithQuestionTrackersDueSerializer(serializers.Serializer):
    quiz = MinimalQuizSerializer()
    question_trackers = UserQuestionTrackerSerializer(many=True)

class CreateAnswersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = [ 'text', 'is_correct']

class CreateQuestionsSerializer(serializers.ModelSerializer):
    answers =  CreateAnswersSerializer(many=True)
    class Meta: 
        model = Question 
        fields = ["question_text", "answers"]

    def validate_answers(self, value):
            if len(value) != 4:
                raise serializers.ValidationError("Each question must have 4 options with one correct answer")
            correct = sum(1 for ans in value if ans.get("is_correct"))
            if correct != 1:
                raise serializers.ValidationError("Each question must have exactly one correct answer")
            return value
        
class CreateQuizSerializer(serializers.ModelSerializer):
    questions = CreateQuestionsSerializer(many=True)

    class Meta:
        model = Quiz
        fields = ["title", "description", "questions"]

    def validate_questions(self, value):
            if len(value) <= 4:
                raise serializers.ValidationError("Quizzes must have at least 5 questions")
            return value
        
class CreateCourseSerializer(serializers.ModelSerializer):
    quizzes = CreateQuizSerializer(many=True)

    class Meta:
        model = Course 
        fields = ["title", "description", "quizzes"]

    def create(self, validated_data):
            quizzes_data = validated_data.pop("quizzes")
            course = Course.objects.create(**validated_data)

            for quiz_data in quizzes_data:
                questions_data = quiz_data.pop("questions")
                quiz = Quiz.objects.create(course=course, **quiz_data)

                for question_data in questions_data:
                    answers_data = question_data.pop("answers")  
                    question = Question.objects.create(quiz=quiz, **question_data)

                    for answer_data in answers_data:
                        Answer.objects.create(question=question, **answer_data)

            return course

class QuizListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ["id", "title", "description"]

class CourseWithQuizzesSerializer(serializers.ModelSerializer):
    quizzes = QuizListSerializer(many=True, read_only=True)
    class Meta:
        model = Quiz
        fields = ["id", "title", "description", "quizzes"]

    
class GroupSerializer(serializers.ModelSerializer):
    members = serializers.PrimaryKeyRelatedField(many=True, queryset=User.objects.filter(role="employee"))

    class Meta:
        model = Group 
        fields = ["id", "name", "members", "created_at", "created_by"]
        read_only_fields = ["created_at", "created_by"]

    def create(self, validated_data):
        request = self.context.get("request")
        members = validated_data.pop("members")
        group =  Group.objects.create(created_by=request.user, **validated_data)
        group.members.set(members)
        return group

class GroupCourseAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model= GroupCourseAssignment 
        fields = ["id", "course", "group", "deadline", "assigned_at", "assigned_by"]
        read_only_fields = ["assigned_at", "assigned_by"]

    def validate_deadline(self, value):
        if value <= timezone.now():
         raise serializers.ValidationError("Deadline must be in the future.")
        return value
    
    def create(self, validated_data):
        request = self.context.get("request")
        return GroupCourseAssignment.objects.create(assigned_by=request.user, **validated_data)

class GroupWithCourseAssignmentSerializer(serializers.Serializer):
    name = serializers.CharField()
    members = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role="employee"), many=True)
    courses = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), many=True)
    deadline = serializers.DateTimeField()

    def create(self, validated_data):
        request = self.context["request"]
        # ensures that a group isn't created without assigning courses to employees because i had invalid groups being created
        with transaction.atomic():
            group = Group.objects.create(
                name=validated_data["name"],
                created_by=request.user
            )
            group.members.set(validated_data["members"])

            for course in validated_data["courses"]:
                GroupCourseAssignment.objects.create(
                    course=course,
                    group=group,
                    assigned_by=request.user,
                    deadline=validated_data["deadline"]
                )

            return group
