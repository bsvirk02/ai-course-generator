import json
import os
from django.conf import settings
from django.shortcuts import render
import requests
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from quiz.models import QuizWithQuestionTrackersDue, User, Quiz, Question,Answer, Course, GroupCourseAssignment, UserQuestionTracker, Group
from quiz.serializers import GroupWithCourseAssignmentSerializer, QuizSerializer, CreateCourseSerializer, CourseWithQuizzesSerializer, GroupCourseAssignmentSerializer, GroupSerializer, QuizWithQuestionTrackersDueSerializer, UpdateUserProfileSerializer, ViewOtherUsersSerializer
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser

# Add this to your views.py file
from django.db import transaction
import groq
import json

def generate_course_with_ai(self, topic, description):
    """Generate course content using Groq API"""
    try:
        # Set up Groq API
        groq_api_key = os.environ.get("GROQ_API_KEY")
        
        if not groq_api_key:
            raise Exception("Groq API key not found. Please set the GROQ_API_KEY environment variable.")
        
        client = groq.Groq(api_key=groq_api_key)
        
        # Create prompt for course generation with explicit JSON formatting instructions
        prompt = f"""
        Create a DEI (Diversity, Equity, and Inclusion) course on the topic: "{topic}".
        
        Additional description: {description}
        
        The course should include:
        1. A clear title
        2. A comprehensive description
        3. Two quizzes, each with 5 questions
        4. Each question should have 4 answer options with exactly one correct answer
        
        You MUST format the response as a valid JSON object with the following structure:
        {{
            "title": "Course Title",
            "description": "Course description...",
            "quizzes": [
                {{
                    "title": "Quiz Title",
                    "description": "Quiz description...",
                    "questions": [
                        {{
                            "question_text": "Question text...",
                            "answers": [
                                {{"text": "Answer 1", "is_correct": false}},
                                {{"text": "Answer 2", "is_correct": true}},
                                {{"text": "Answer 3", "is_correct": false}},
                                {{"text": "Answer 4", "is_correct": false}}
                            ]
                        }},
                        // More questions...
                    ]
                }},
                // Second quiz...
            ]
        }}
        
        IMPORTANT: Ensure your response is valid JSON. Do not include any explanations, markdown formatting, or text outside of the JSON structure.
        """
        
        # Call Groq API
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful assistant that creates DEI courses. You always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            model="llama3-70b-8192",  # Using Llama 3 model
            temperature=0.5,  # Lower temperature for more consistent output
            max_tokens=4000
        )
        
        # Parse response
        content = response.choices[0].message.content
        
        # Clean up the content to ensure it's valid JSON
        # Remove any markdown code block indicators
        content = content.replace("```json", "").replace("```", "").strip()
        
        # Try to parse the JSON
        try:
            course_data = json.loads(content)
        except json.JSONDecodeError:
            # If direct parsing fails, try to extract JSON using regex
            import re
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                try:
                    course_data = json.loads(json_match.group(0))
                except:
                    raise Exception("Failed to parse AI response. Please try again.")
            else:
                raise Exception("Failed to parse AI response. Please try again.")
        
        # Validate the structure of the course data
        if not all(key in course_data for key in ["title", "description", "quizzes"]):
            raise Exception("AI response missing required fields. Please try again.")
        
        return course_data
        
    except json.JSONDecodeError:
        raise Exception("Failed to parse AI response. Please try again.")
    except Exception as e:
        raise Exception(f"Error generating course with AI: {str(e)}")
    
class LoginView(APIView):
    
    def post(self, request):
         username = request.data.get("username")
         password = request.data.get("password")

         if not username or not password:
              return Response({"message": "Correct Username and Password required"}, status=400)
         
         user = authenticate(username=username, password=password)

         if user is not None:
              # Generates tokens for the authenticated user
              refresh = RefreshToken.for_user(user)

              return Response({"refresh": str(refresh), "access": str(refresh.access_token)})
         else:
              return Response({"error": "Invalid credentials!"}, status=401)

class LogoutView(APIView):
     # A user is only allowed to logout if they are logged in
     permission_classes =[IsAuthenticated]

     def post(self, request):
          try:
               # Gets the user’s token
               refresh_token = request.data.get("refresh_token")
               if not refresh_token:
                    return Response({"error": "Refresh token is needed to logout"}, status=200)
               # Refreshes the token and later deletes
               token = RefreshToken(refresh_token)
               token.blacklist()

               return Response({"message": "Logged out successfully"}, status=200)
          except:
               return Response({"error": "Invalid or missing refresh token"}, status=400)
          
class HomeView(APIView):
     # Home page is only accessed when the user is logged in
     permission_classes = [IsAuthenticated]

     def get(self, request):
          return Response({"message": "Welcome to the home page!!!"})
     
class CoursesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            courses = Course.objects.prefetch_related("quizzes").all()
            serializer = CourseWithQuizzesSerializer(courses, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
class QuizView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, quiz_id):
        try:
            quiz = Quiz.objects.get(id=quiz_id)
            # get_question_trackers_due now uses __lte lookup
            question_trackers = quiz.get_question_trackers_due(request.user)
            bundle = QuizWithQuestionTrackersDue(quiz, question_trackers)
            serializer = QuizWithQuestionTrackersDueSerializer(bundle)
            return Response(serializer.data)
        except Quiz.DoesNotExist:
            return Response({"error": "Quiz not found."}, status=404)

    def patch(self, request, quiz_id):
        try:
            quiz = Quiz.objects.get(id=quiz_id)
            response_qualities = request.data
            for question_id in response_qualities:
                tracker = UserQuestionTracker.objects.get(user=request.user,
                                                          question__id=int(question_id))
                tracker.update(response_qualities[question_id])
            return Response(status=204)
        except Quiz.DoesNotExist:
            return Response({"error": "Quiz not found."}, status=404)
        
class CulturalNews(APIView):
    # This probably isn’t needed, but I wasn’t sure.
    permission_classes = [IsAuthenticated]


class CulturalNewsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        print("CulturalNews endpoint hit")
        query = "inclusivity in workplace"
        api_key = os.getenv("NEWS_API_KEY")  # make sure this is set in your environment
          
        url = f"https://newsapi.org/v2/everything?q={query}&language=en&pageSize=20&sortBy=relevancy&apiKey={api_key}"

        try:
            response = requests.get(url)
            data = response.json()

            if response.status_code == 200:
                articles = data.get("articles", [])
                ten_articles = articles[:10]
                print(f"NewsAPI Data: {len(articles)} total articles")
                print(f"NewsAPI Data: {len(ten_articles)} artiles being shown")
                return Response({"articles": ten_articles}, status=200)

            else:
                return Response({"error": data.get("message", "Failed to retrieve news")}, status=response.status_code)

        except requests.RequestException as e:
            return Response({"error": str(e)}, status=500)

class LeaderboardView(APIView):
     permission_classes = [IsAuthenticated]

     def get(self, request):
          top10_users = User.objects.order_by('-points_count')[:10]

          leaderboard = [
               {
                    "profilePic": request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None,
                    "rank": index + 1,
                    "name": user.name,
                    "country": user.country,
                    "points": user.points_count,

               }
               for index, user in enumerate(top10_users)
          ]
          return Response({"leaderboard": leaderboard}, status=200)
class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # show all the users except the current user
        users = User.objects.all()
        serializer = ViewOtherUsersSerializer(users, many=True, context={"request": request})
        return Response(serializer.data)
    

class CourseCreationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = self.request.user
        print("User:", user.username, "| Role:", user.role)


        if user.role not in ["manager", "hr"]:
            return Response({"error": "Only managers or HR can create a course"}, status=403)
        serializer = CreateCourseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=user)
            return Response(serializer.data, status=201)
        else:
            print(serializer.errors) 
            return Response(serializer.errors, status=400)

from rest_framework.parsers import MultiPartParser, FormParser

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    # this parser class helps handle files that aren't json such as when a user is uploading a profile picture
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        serializer = UpdateUserProfileSerializer(request.user, context={"request": request})
        return Response(serializer.data)

    def patch(self, request):
        serializer = UpdateUserProfileSerializer(request.user, data=request.data, partial=True, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(UpdateUserProfileSerializer(request.user, context={"request": request}).data, status=200)
        return Response(serializer.errors, status=400)

class CreateGroupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = self.request.user

        if user.role not in ["manager"]:
            return Response({"error": "Only managers can assign groups"}, status=403)     
        data = request.data.copy()
        serializer = GroupSerializer(data=data, context={"request": request})
        if serializer.is_valid():
            group = serializer.save(created_by=user)
            return Response(GroupSerializer(group).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class GroupCourseAssignmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = self.request.user

        if  user.role not in ["manager"]:
            return Response({"error": "Only managers can assign courses to employees"}, status=403)
        
        data = self.request.data.copy()
        data["assigned_by"] = user.id
        serializer = GroupCourseAssignmentSerializer(data=data, context={"request": request})
        if serializer.is_valid():
            assignment  = serializer.save()
            return Response(GroupCourseAssignmentSerializer(assignment).data, status=201)
        return Response(serializer.errors, status=400)

class AssignGroupAndCoursesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = GroupWithCourseAssignmentSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            group = serializer.save()
            return Response({"message": "Group and courses have been created successfully", "group_id": group.id}, status=201)
        return Response(serializer.errors, status=400)

class GroupListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        groups = Group.objects.prefetch_related("members", "groupcourseassignment_set__course", "created_by")
        data = []

        for group in groups:
            group_data = {
                "id": group.id,
                "name": group.name,
                "members": [{"id": m.user_id, "name": m.name} for m in group.members.all()],
            }

            if request.user.role in ["manager", "hr"] or request.user in group.members.all():
                assignments = group.groupcourseassignment_set.all()
                group_data["assignments"] = [
                 {
                "id": a.id,  
                "course": a.course.title,
                "course_id": a.course.id,
                "quiz_id": a.course.quizzes.first().id if a.course.quizzes.exists() else None,
                "deadline": a.deadline.isoformat(), 
                "assigned_by": a.assigned_by.name,
                "assigned_at": a.assigned_at.isoformat(),
                } for a in assignments
                ]

            data.append(group_data)

        return Response(data)

# Add this to views.py
class GroupProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, group_id):
        try:
            # Get the group
            group = Group.objects.get(id=group_id)
            
            # Get all group course assignments for this group
            assignments = GroupCourseAssignment.objects.filter(group=group)
            
            if not assignments.exists():
                return Response({"progress": 0}, status=200)
            
            total_progress = 0
            
            for assignment in assignments:
                course = assignment.course
                quizzes = Quiz.objects.filter(course=course)
                
                if not quizzes.exists():
                    continue
                
                # Get all members in the group
                members = group.members.all()
                member_count = members.count()
                
                if member_count == 0:
                    continue
                
                # For each quiz in the course
                for quiz in quizzes:
                    # Get all questions in the quiz
                    questions = Question.objects.filter(quiz=quiz)
                    question_count = questions.count()
                    
                    if question_count == 0:
                        continue
                    
                    # Calculate total possible correct answers
                    total_possible_correct = member_count * question_count
                    
                    # Calculate actual correct answers
                    correct_answers = 0
                    for member in members:
                        # Get all question trackers for this user and quiz
                        trackers = UserQuestionTracker.objects.filter(
                            user=member,
                            question__quiz=quiz
                        )
                        
                        # Count correct answers
                        for tracker in trackers:
                            if tracker.is_correct:
                                correct_answers += 1
                    
                    # Calculate progress percentage for this quiz
                    # Each correct answer is worth 2% (as per requirement)
                    if total_possible_correct > 0:
                        quiz_progress = (correct_answers / total_possible_correct) * 100
                        total_progress += quiz_progress
            
            # Average progress across all assignments
            if assignments.count() > 0:
                total_progress = total_progress / assignments.count()
            
            return Response({"progress": round(total_progress, 1)}, status=200)
            
        except Group.DoesNotExist:
            return Response({"error": "Group not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
class GenerateCourseView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Check if user has permission to create courses
        user = request.user
        if user.role not in ["manager", "hr"]:
            return Response({"error": "Only managers or HR can create courses"}, status=status.HTTP_403_FORBIDDEN)
        
        # Get topic and description from request
        topic = request.data.get("topic")
        description = request.data.get("description", "")
        
        if not topic:
            return Response({"error": "Course topic is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Generate course content using Groq API
            course_data = generate_course_with_ai(self, topic, description)
            
            # Save course to database
            with transaction.atomic():
                # Create course
                course = Course.objects.create(
                    title=course_data["title"],
                    description=course_data["description"],
                    created_by=user
                )
                
                # Create quizzes
                for quiz_data in course_data["quizzes"]:
                    quiz = Quiz.objects.create(
                        course=course,
                        title=quiz_data["title"],
                        description=quiz_data["description"]
                    )
                    
                    # Create questions and answers
                    for question_data in quiz_data["questions"]:
                        question = Question.objects.create(
                            quiz=quiz,
                            question_text=question_data["question_text"]
                        )
                        
                        # Create answers
                        for answer_data in question_data["answers"]:
                            Answer.objects.create(
                                question=question,
                                text=answer_data["text"],
                                is_correct=answer_data["is_correct"]
                            )
            
            return Response({
                "message": "Course generated successfully",
                "course_id": course.id
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Error in course generation: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)