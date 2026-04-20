"use client"

import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { Trophy, Medal, User, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

const LeaderboardWidget = () => {
  const [topUsers, setTopUsers] = useState([])
  const [userRank, setUserRank] = useState(null)
  const [loading, setLoading] = useState(true)
  const { getAccessTokenSilently, user } = useAuth0()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const token = await getAccessTokenSilently()

        const response = await fetch("http://localhost:8000/api/leaderboard/", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data")
        }

        const data = await response.json()
        setTopUsers(data.leaderboard.slice(0, 5))

        const currentUserIndex = data.leaderboard.findIndex((u) => u.name === user?.name)
        if (currentUserIndex !== -1) {
          setUserRank({
            rank: currentUserIndex + 1,
            ...data.leaderboard[currentUserIndex],
          })
        }
      } catch (error) {
        console.log("Using mock data due to API error:", error)
        setTopUsers([
          { name: "Sarah Johnson", points: 850, profilePic: null },
          { name: "Michael Chen", points: 720, profilePic: null },
          { name: "Aisha Patel", points: 685, profilePic: null },
          { name: "David Kim", points: 610, profilePic: null },
          { name: "Maria Rodriguez", points: 590, profilePic: null },
        ])
        setUserRank({ rank: 8, name: user?.name || "You", points: 450, profilePic: user?.picture })
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [getAccessTokenSilently, user])

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 2:
        return <Medal className="h-5 w-5 text-yellow-700" />
      default:
        return <span className="text-gray-500 font-medium">{index + 1}</span>
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-red-600" />
            Leaderboard
          </h3>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-red-600" />
          Leaderboard
        </h3>
        <button
          onClick={() => navigate("/leaderboard")}
          className="text-red-600 hover:text-red-800 flex items-center text-sm bg-red-50 px-2 py-1 rounded-full hover:bg-red-100 transition-colors"
        >
          View full
          <ArrowRight className="ml-1 h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {topUsers.map((user, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-2 rounded-md ${
              index === 0 ? "bg-gradient-to-r from-yellow-300 to-yellow-500" : "bg-gray-50"
            } hover:bg-gray-100 transition-colors`}
          >
            <div className="flex items-center">
              <div className="w-8 flex justify-center mr-2">{getRankIcon(index)}</div>
              <div className="flex items-center">
                {user.profilePic ? (
                  <img
                    src={user.profilePic || "/placeholder.svg?height=32&width=32&query=user"}
                    alt={user.name}
                    className="h-8 w-8 rounded-full mr-3 object-cover border border-gray-200"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                    <span className="text-red-600 font-medium">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <span className="font-medium">{user.name}</span>
              </div>
            </div>
            <span className="font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-sm">
              {user.points} pts
            </span>
          </div>
        ))}
      </div>

      {userRank && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between p-2 bg-red-50 rounded-md">
            <div className="flex items-center">
              <div className="w-8 flex justify-center mr-2">
                <span className="text-gray-500 font-medium">#{userRank.rank}</span>
              </div>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                  <User className="h-4 w-4 text-red-600" />
                </div>
                <span className="font-medium">You</span>
              </div>
            </div>
            <span className="font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-sm">
              {userRank.points} pts
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeaderboardWidget
