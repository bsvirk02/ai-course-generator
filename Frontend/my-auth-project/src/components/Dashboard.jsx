"use client"

import { useEffect, useState } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { BookOpen, Award, Clock, CheckCircle, ArrowRight, User, Zap } from "lucide-react"
import Layout from "./Layout"
import LeaderboardWidget from "./LeaderboardWidget"
import RecentActivity from "./RecentActivity"
import AssignmentCard from "./AssignmentCard"
import { useNavigate } from "react-router-dom"

const Dashboard = () => {
  const [userProfile, setUserProfile] = useState(null)
  const [courses, setCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [stats, setStats] = useState({
    completedCourses: 0,
    inProgressCourses: 0,
    totalPoints: 0,
    currentStreak: 0,
  })
  const [loading, setLoading] = useState(true)
  const { getAccessTokenSilently, user, isAuthenticated, isLoading } = useAuth0()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || isLoading) return

      try {
        setLoading(true)
        const token = await getAccessTokenSilently()

        const profileRes = await fetch("http://localhost:8000/api/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setUserProfile(profileData)
        }

        const coursesRes = await fetch("http://localhost:8000/api/courses/", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (coursesRes.ok) {
          const coursesData = await coursesRes.json()
          setCourses(coursesData)
        }

        const dashboardRes = await fetch("http://localhost:8000/api/dashboard/", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (dashboardRes.ok) {
          const dashboardData = await dashboardRes.json()
          setAssignments(dashboardData.assignments)
          setStats(dashboardData.stats)
        }
      } catch (error) {
        console.error("Error setting up dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated, isLoading, getAccessTokenSilently, user])

  if (isLoading || loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl p-8 mb-10 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {userProfile?.name || "User"}</h1>
              <p className="text-red-100 text-lg">Track your progress, view upcoming deadlines, and continue your DEI learning journey.</p>
            </div>
            <div className="hidden md:block">
              <img src={userProfile?.profile_picture || "/default.png"} alt="Profile" className="h-20 w-20 rounded-full border-4 border-white shadow-md" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center hover:shadow-xl transition-all">
            <div className="bg-red-100 rounded-full p-3 mr-4">
              <BookOpen className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Courses in Progress</p>
              <p className="text-2xl font-bold">{stats.inProgressCourses}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 flex items-center hover:shadow-xl transition-all">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed Courses</p>
              <p className="text-2xl font-bold">{stats.completedCourses}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 flex items-center hover:shadow-xl transition-all">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Points</p>
              <p className="text-2xl font-bold">{stats.totalPoints}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 flex items-center hover:shadow-xl transition-all">
            <div className="bg-purple-100 rounded-full p-3 mr-4">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Streak</p>
              <p className="text-2xl font-bold">{stats.currentStreak} days</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Clock className="h-6 w-6 mr-2 text-red-600" />
                  Upcoming Deadlines
                </h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{assignments.length} assignment{assignments.length !== 1 ? "s" : ""}</span>
              </div>

              {assignments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignments.map((assignment, index) => (
                    <AssignmentCard key={index} assignment={assignment} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming deadlines at the moment.</p>
                  <p className="text-sm text-gray-400 mt-2">You're all caught up!</p>
                </div>
              )}
            </div>

            <div className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <BookOpen className="h-6 w-6 mr-2 text-red-600" />
                  Continue Learning
                </h2>
                <button onClick={() => navigate("/courses")} className="text-red-600 hover:text-red-800 flex items-center bg-red-50 px-3 py-1 rounded-full transition-colors hover:bg-red-100">
                  View all courses
                  <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>

              {userProfile?.inProgressCourses?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userProfile.inProgressCourses.map((course, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                      <div className="h-3 bg-gradient-to-r from-red-500 to-red-700" style={{ width: `${course.progress}%` }}></div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg mb-2 line-clamp-1">{course.title}</h3>
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                          <span className="font-medium">{Math.round(course.progress)}% complete</span>
                          <span className="text-xs">Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}</span>
                        </div>
                        <button onClick={() => navigate(`/courses/${course.id}`)} className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center">
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">You haven't started any courses yet.</p>
                  <button onClick={() => navigate("/courses")} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                    Browse Courses
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <LeaderboardWidget />
            <RecentActivity />

            <div className="mt-8 bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-6 shadow-md">
              <h3 className="font-bold text-lg mb-4 text-red-800">Your Learning Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex items-center">
                    <Award className="w-4 h-4 mr-2 text-red-600" />
                    Points Earned
                  </span>
                  <span className="font-bold">{stats.totalPoints}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Completion Rate
                  </span>
                  <span className="font-bold">
                    {stats.completedCourses + stats.inProgressCourses > 0
                      ? Math.round((stats.completedCourses / (stats.completedCourses + stats.inProgressCourses)) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-purple-600" />
                    Current Streak
                  </span>
                  <span className="font-bold">{stats.currentStreak} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
