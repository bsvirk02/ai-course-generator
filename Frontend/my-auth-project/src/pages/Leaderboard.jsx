import { useEffect, useState, useRef } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { Trophy, Medal, User } from "lucide-react"
import Layout from "../components/Layout"

const Leaderboard = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0()
  const wsRef = useRef(null)

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const token = await getAccessTokenSilently()
      const response = await fetch("http://localhost:8000/api/leaderboard/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setUsers(data.leaderboard || [])
    } catch (error) {
      console.error("Error getting the leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }



  useEffect(() => {
    if (isAuthenticated) {
      fetchLeaderboard()
    }
  }, [isAuthenticated, getAccessTokenSilently])

  // WebSocket connection for live leaderboard
  useEffect(() => {
    if (!isAuthenticated) return

    const ws = new WebSocket(`ws://localhost:8000/ws/leaderboards/`)
    wsRef.current = ws

    ws.onopen = () => {
      console.log("WebSocket connected for leaderboard")
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.leaderboard) {
        setUsers(data.leaderboard)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
    }

    ws.onclose = () => {
      console.log("WebSocket disconnected")
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [isAuthenticated])

  // Find current user's rank
  const currentUserRank = users.findIndex((u) => u.name === user?.name) + 1

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Leaderboard</h1>
        </div>

        {currentUserRank > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-full p-2 mr-4">
                <User className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-gray-600">Your current rank</p>
                <p className="text-xl font-bold text-red-600">#{currentUserRank}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Rank
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Country
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user, index) => (
                    <tr
                      key={index}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-red-50 transition-colors`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index === 0 ? (
                            <Trophy className="w-5 h-5 text-yellow-500 mr-1" />
                          ) : index === 1 ? (
                            <Medal className="w-5 h-5 text-gray-400 mr-1" />
                          ) : index === 2 ? (
                            <Medal className="w-5 h-5 text-yellow-700 mr-1" />
                          ) : (
                            <span className="text-gray-500 font-medium">{index + 1}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.profilePic ? (
                            <img
                              src={user.profilePic || "/placeholder.svg"}
                              alt={user.name}
                              className="h-10 w-10 rounded-full mr-3 object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                              <span className="text-red-600 font-medium">{user.name.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.country || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.points}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Leaderboard
