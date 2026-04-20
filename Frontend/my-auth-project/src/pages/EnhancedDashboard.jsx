// In src/pages/Dashboard.jsx (or wherever your dashboard component is located)
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Award, Clock, Calendar, BarChart3, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import Layout from "../components/Layout";
import LeaderboardWidget from "../components/LeaderboardWidget";
import RecentActivity from "../components/RecentActivity";
import AssignmentCard from "../components/AssignmentCard";
import CourseProgress from "../components/CourseProgress";

const EnhancedDashboard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({
    completedCourses: 0,
    inProgressCourses: 0,
    totalPoints: 0,
    currentStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently, user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const userId = user.sub?.split("|")[1] || user.sub;
    const ws = new WebSocket(`ws://localhost:8000/ws/dashboard/${userId}/`);

    ws.onopen = () => {
      console.log("Dashboard WebSocket connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "assignment_update") {
        setAssignments(prev => [...prev, data.assignment]);
      } else if (data.type === "course_progress_update") {
        setCourses(prev => prev.map(course => 
          course.id === data.course.id ? { ...course, ...data.course } : course
        ));
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, [isAuthenticated, user]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        const token = await getAccessTokenSilently();

        // Fetch dashboard data
        const dashboardRes = await fetch("http://localhost:8000/api/dashboard/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (dashboardRes.ok) {
          const dashboardData = await dashboardRes.json();
          setStats(dashboardData.stats);
          setCourses(dashboardData.inProgressCourses);
          setAssignments(dashboardData.assignments);
        }

        // Fetch user profile
        const profileRes = await fetch("http://localhost:8000/api/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserProfile(profileData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, getAccessTokenSilently]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-8 mb-10 shadow-sm">
          <h1 className="text-3xl font-bold text-red-600 mb-2">
            Welcome back, {userProfile?.name || user?.name || "User"}
          </h1>
          <p className="text-gray-700 text-lg">
            Track your progress, view upcoming deadlines, and continue your DEI learning journey.
          </p>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats and Assignments */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
                <div className="bg-red-100 rounded-full p-2 mr-3">
                  <BookOpen className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">In Progress</p>
                  <p className="text-xl font-bold">{stats.inProgressCourses}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
                <div className="bg-green-100 rounded-full p-2 mr-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-xl font-bold">{stats.completedCourses}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <Award className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Points</p>
                  <p className="text-xl font-bold">{stats.totalPoints}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
                <div className="bg-purple-100 rounded-full p-2 mr-3">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Streak</p>
                  <p className="text-xl font-bold">{stats.currentStreak}d</p>
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Upcoming Deadlines</h2>
                <Clock className="h-5 w-5 text-gray-400" />
              </div>

              {assignments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assignments.slice(0, 4).map((assignment, index) => (
                    <AssignmentCard key={index} assignment={assignment} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-500">No upcoming deadlines at the moment.</p>
                </div>
              )}
            </div>

            {/* Continue Learning */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Continue Learning</h2>
                <button
                  onClick={() => navigate("/courses")}
                  className="text-red-600 hover:text-red-800 flex items-center text-sm"
                >
                  View all courses
                  <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>

              {courses.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {courses.slice(0, 2).map((course, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-lg">{course.title}</h3>
                          <span className="text-sm text-gray-500">
                            Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}
                          </span>
                        </div>

                        <CourseProgress courseId={course.id} />

                        <button
                          onClick={() => navigate(`/courses/${course.id}`)}
                          className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-500 mb-4">You haven't started any courses yet.</p>
                  <button
                    onClick={() => navigate("/courses")}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Browse Courses
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Leaderboard and Activity */}
          <div className="space-y-8">
            <LeaderboardWidget />
            <RecentActivity />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EnhancedDashboard;