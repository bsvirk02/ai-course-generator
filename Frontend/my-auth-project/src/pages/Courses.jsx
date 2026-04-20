// In your Courses.jsx file
"use client"

import { useEffect, useState } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { Link, useNavigate } from "react-router-dom"
import { BookOpen, Plus, Clock, ChevronRight, Sparkles } from 'lucide-react'
import Layout from "../components/Layout"

const Courses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState("")
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://127.0.0.1:8000/",
        })

        // ✅ Fetch role from backend profile API
        const profileRes = await fetch("http://localhost:8000/api/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setUserRole(profileData.role)
          console.log("User role:", profileData.role) // Debug log
        } else {
          throw new Error("Failed to load user role")
        }

        // ✅ Fetch courses
        const courseRes = await fetch("http://localhost:8000/api/courses/", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!courseRes.ok) throw new Error("Failed to load courses")

        const data = await courseRes.json()
        console.log("Courses data:", data) // Debug log

        const sortedCourses = data.map((course) => ({
          ...course,
          quizzes: course.quizzes.sort(
            (a, b) => new Date(a.date_created) - new Date(b.date_created)
          ),
        }))

        setCourses(sortedCourses)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchData()
    }
  }, [getAccessTokenSilently, isAuthenticated])

  const handleCreateCourse = () => {
    navigate("/create-course")
  }

  const handleGenerateCourse = () => {
    navigate("/generate-course")
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Courses</h1>
          {(userRole === "hr" || userRole === "manager") && (
            <div className="flex space-x-3">
              <button
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                onClick={handleCreateCourse}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Course
              </button>
              <button
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                onClick={handleGenerateCourse}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                AI Generate Course
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No courses available.</p>
            {(userRole === "hr" || userRole === "manager") && (
              <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={handleCreateCourse}
                  className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Course Manually
                </button>
                <button
                  onClick={handleGenerateCourse}
                  className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Course with AI
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Quizzes</h3>
                    {course.quizzes.length > 0 ? (
                      <ul className="space-y-2">
                        {course.quizzes.map((quiz) => (
                          <li key={quiz.id} className="border-l-2 border-red-200 pl-3">
                            <Link
                              to={`/quiz/${quiz.id}`}
                              className="flex items-center justify-between text-gray-700 hover:text-red-600 group"
                            >
                              <span>{quiz.title}</span>
                              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm italic">No quizzes available for this course</p>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>
                      {course.quizzes.length > 0
                        ? `${course.quizzes.length} quiz${course.quizzes.length > 1 ? "zes" : ""}`
                        : "No quizzes"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Courses