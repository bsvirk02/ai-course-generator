import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import Layout from "../components/Layout"

const ViewUsers = () => {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUsers = async () => {
            if (!isAuthenticated) return

            try {
                setLoading(true)
                const token = await getAccessTokenSilently()
                const res = await fetch("http://localhost:8000/api/users/", {
                    headers: { Authorization: `Bearer ${token}` },
                })

                if (!res.ok) {
                    throw new Error("Failed to fetch users")
                }

                const data = await res.json()
                setUsers(data)
            } catch (error) {
                console.error("Error fetching users:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [getAccessTokenSilently, isAuthenticated])

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Community Members</h1>
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {users.map(user => (
                            <div key={user.id} className="bg-white shadow-md rounded-lg p-6 text-center">
                                <img
                                    src={user.profilePic || "/default.png"}
                                    alt={user.name}
                                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-red-500"
                                />
                                <h2 className="text-xl font-bold">{user.name}</h2>
                                <p className="text-gray-500">{user.country || "Unknown Country"}</p>
                                <p className="text-sm text-red-600 font-semibold mt-1">{user.role}</p>
                                <p className="text-sm text-gray-700 mt-2">{user.bio || <em>No bio available</em>}</p>
                                <div className="mt-4 space-y-1 text-sm text-gray-600">
                                    <p>
                                        <strong>Points:</strong> 
                                        <span className="font-bold text-red-600 ml-1">{user.points || 0}</span>
                                    </p>
                                    {user.ethnicity && <p><strong>Ethnicity:</strong> {user.ethnicity}</p>}
                                    {user.religion && <p><strong>Religion:</strong> {user.religion}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default ViewUsers