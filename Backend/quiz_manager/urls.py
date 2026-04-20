from django.contrib import admin
from django.urls import path
from quiz.views import AssignGroupAndCoursesView, GroupListView, LoginView, HomeView, LogoutView, CulturalNewsView, LeaderboardView, CoursesView, QuizView, CourseCreationView, CreateGroupView, GroupCourseAssignmentView, ProfileView, UserListView, GroupProgressView, GenerateCourseView  # Added GenerateCourseView here
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/login/", LoginView.as_view(), name="login"),
    path("api/home/", HomeView.as_view(), name="home"),
    path("api/logout/", LogoutView.as_view(), name="logout"),
    path("api/cultural_news/", CulturalNewsView.as_view(), name="cultural_news"),
    path("api/leaderboard/", LeaderboardView.as_view(), name="leaderboard"),
    path("api/courses/", CoursesView.as_view(), name="courses"),
    path("api/quiz/<int:quiz_id>/", QuizView.as_view(), name="quiz"),
    path("api/create_course/", CourseCreationView.as_view(), name="create_course"),
    path("api/assign_groups/", CreateGroupView.as_view(), name="assign_groups"),
    path("api/assign_group_courses/", GroupCourseAssignmentView.as_view(), name="assign_group_courses"),
    path("api/profile/", ProfileView.as_view(), name="profile"),
    path("api/users/", UserListView.as_view(), name="view_users"),
    path("api/assign_group_and_courses/", AssignGroupAndCoursesView.as_view(), name="assign_group_and_courses"),
    path("api/groups/", GroupListView.as_view(), name="groups"),
    path("api/group_progress/<int:group_id>/", GroupProgressView.as_view(), name="group_progress"),
    # Add the new route for AI course generation
    path("api/generate_course/", GenerateCourseView.as_view(), name="generate_course"),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)