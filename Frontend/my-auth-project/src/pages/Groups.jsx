import { useEffect, useState, useCallback } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import Layout from "../components/Layout"
import { format } from "date-fns"
import useWebSocket from "../hooks/useWebSocket"
import { useNavigate } from "react-router-dom"
import GroupProgress from "../components/GroupProgress" // Import the GroupProgress component

const Groups = () => {
    const { getAccessTokenSilently, isAuthenticated, user } = useAuth0()
    const [groups, setGroups] = useState([])
    const [deadlinesMap, setDeadlinesMap] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    
    const currentUserId = user?.sub
    const encodedUserId = encodeURIComponent(user?.sub || '')
    const wsUrl = isAuthenticated && encodedUserId
        ? `ws://localhost:8000/ws/assignments/${encodedUserId}/`
        : null
        
    const onMessage = useCallback((data) => {
        if (data.assignments) {
            const map = {}
            data.assignments.forEach((a) => {
                map[a.id] = a
            })
            setDeadlinesMap(map)
        }
    }, [])
    
    const navigate = useNavigate()

    useWebSocket(wsUrl, onMessage)

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                setLoading(true)
                const token = await getAccessTokenSilently()
                console.log("Got token:", token ? "Yes" : "No") // Debug log
                
                const res = await fetch("http://localhost:8000/api/groups/", {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                })
                
                console.log("API response status:", res.status) // Debug log
                
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}))
                    console.error("API error:", errorData)
                    throw new Error(`API error: ${res.status} ${errorData.detail || ''}`)
                }
                
                const data = await res.json()
                console.log("Groups data:", data) // Debug log
                setGroups(data)
                setError(null)
            } catch (err) {
                console.error("Failed to fetch groups:", err)
                setError("Failed to load groups: " + err.message)
            } finally {
                setLoading(false)
            }
        }
        
        if (isAuthenticated) {
            fetchGroups()
        }
    }, [getAccessTokenSilently, isAuthenticated])

    return (
        <Layout>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">All Groups</h1>
            
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            ) : groups.length === 0 ? (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    No groups found. Please create a group first.
                </div>
            ) : (
                groups.map((group) => {
                    const isMember = group.members.some(m => m.id === currentUserId)

                    return (
                        <div key={group.id} className="mb-6 p-4 border rounded bg-white shadow">
                            <h2 className="text-xl font-semibold text-gray-900">{group.name}</h2>
                            <p className="mt-1 text-gray-700 font-medium">Members:</p>
                            <ul className="list-disc ml-6 text-gray-700">
                                {group.members.map((m) => (
                                    <li key={m.id}>{m.name}</li>
                                ))}
                            </ul>

                            {group.assignments && (
                                <div className="mt-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">Assigned Courses:</h3>
                                    {group.assignments.map((a, i) => {
                                        const live = deadlinesMap[a.id]

                                        return (
                                            <div key={i} className="mb-4 p-3 rounded bg-gray-50 border">
                                                <p className="text-gray-900 font-medium">Course: {a.course}</p>
                                                <p className="text-sm text-gray-500">
                                                    Deadline: {format(new Date(a.deadline), "PPPp")}
                                                </p>
                                                {live?.time_remaining ? (
                                                    <p className="text-sm text-red-600 font-semibold">
                                                        Time Remaining: {live.time_remaining}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm text-gray-500">Calculating time remaining...</p>
                                                )}

                                                {/* Use the GroupProgress component */}
                                                <GroupProgress groupId={group.id} courseName={a.course} />

                                                {isMember && (
                                                    <button
                                                        className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                        onClick={() => navigate(`/quiz/${a.quiz_id}`)}
                                                    >
                                                        Start Course
                                                    </button>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })
            )}
        </Layout>
    )
}

export default Groups