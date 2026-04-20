"use client"

import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { CheckCircle, Clock, Award } from "lucide-react"

const CourseProgress = ({ courseId }) => {
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { getAccessTokenSilently } = useAuth0()

  useEffect(() => {
    const fetchProgress = async () => {
      if (!courseId) return

      try {
        setLoading(true)
        const token = await getAccessTokenSilently()

        // Try to fetch from API
        try {
          const response = await fetch(`http://localhost:8000/api/courses/${courseId}/progress/`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          if (!response.ok) {
            throw new Error("Failed to fetch course progress")
          }

          const data = await response.json()
          setProgress(data)
        } catch (error) {
          // Mock data for demonstration
          console.log("Using mock data due to API error:", error)
          setProgress({
            lessonsComplete: 3,
            lessonsTotal: 5,
            courseCompletionPercentage: 60,
            pointsEarned: 75,
          })
        }
      } catch (error) {
        console.error("Error fetching course progress:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [courseId, getAccessTokenSilently])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 text-sm">Error loading progress: {error}</div>
  }

  if (!progress) {
    return <div className="text-gray-500 text-sm">No progress data available</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2 text-gray-500" />
          <span className="text-sm text-gray-500">
            {progress.lessonsComplete} of {progress.lessonsTotal} lessons completed
          </span>
        </div>
        <span className="text-sm font-medium bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
          {Math.round(progress.courseCompletionPercentage)}%
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-red-500 to-red-700 h-2.5 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progress.courseCompletionPercentage}%` }}
        ></div>
      </div>

      {progress.courseCompletionPercentage === 100 && (
        <div className="flex items-center justify-between bg-green-50 p-2 rounded-md mt-2">
          <div className="flex items-center text-green-600 text-sm">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span>Course completed</span>
          </div>
          <div className="flex items-center text-green-600 text-sm">
            <Award className="w-4 h-4 mr-1" />
            <span>+{progress.pointsEarned || 100} points</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseProgress
