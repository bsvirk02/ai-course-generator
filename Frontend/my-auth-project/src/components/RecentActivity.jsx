"use client"

import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { CheckCircle, Award, BookOpen, Clock, Activity } from "lucide-react"

const RecentActivity = () => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const { getAccessTokenSilently } = useAuth0()

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const token = await getAccessTokenSilently()

        // Try to fetch from API
        try {
          const response = await fetch("http://localhost:8000/api/activities/", {
            headers: { Authorization: `Bearer ${token}` },
          })

          if (response.ok) {
            const data = await response.json()
            setActivities(data.activities)
          } else {
            throw new Error("Failed to fetch activities")
          }
        } catch (error) {
          // Mock data for demonstration
          console.log("Using mock data due to API error:", error)
          setActivities([
            {
              id: 1,
              type: "quiz_completed",
              title: "Religious Food Taboos",
              points: 25,
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: 2,
              type: "course_started",
              title: "Different Cultural Celebrations Around The World",
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: 3,
              type: "streak_milestone",
              days: 7,
              points: 50,
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ])
        }
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [getAccessTokenSilently])

  const getActivityIcon = (type) => {
    switch (type) {
      case "quiz_completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "course_started":
        return <BookOpen className="h-5 w-5 text-blue-500" />
      case "course_completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "streak_milestone":
        return <Award className="h-5 w-5 text-purple-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getActivityText = (activity) => {
    switch (activity.type) {
      case "quiz_completed":
        return `Completed quiz: ${activity.title} (+${activity.points} points)`
      case "course_started":
        return `Started course: ${activity.title}`
      case "course_completed":
        return `Completed course: ${activity.title} (+${activity.points} points)`
      case "streak_milestone":
        return `${activity.days} day streak achieved! (+${activity.points} points)`
      default:
        return "Unknown activity"
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-red-600" />
          Recent Activity
        </h3>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300">
      <h3 className="font-bold text-lg mb-4 flex items-center">
        <Activity className="h-5 w-5 mr-2 text-red-600" />
        Recent Activity
      </h3>

      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start hover:bg-gray-50 p-2 rounded-md transition-colors">
              <div className="bg-gray-100 rounded-full p-2 mr-3">{getActivityIcon(activity.type)}</div>
              <div className="flex-1">
                <p className="text-sm font-medium">{getActivityText(activity)}</p>
                <p className="text-xs text-gray-500 mt-1">{formatTimestamp(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No recent activity</p>
          <p className="text-sm text-gray-400 mt-2">Your learning activities will appear here</p>
        </div>
      )}
    </div>
  )
}

export default RecentActivity
