import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { Link } from "react-router-dom"
import { User, Award, Clock, Settings, ChevronRight } from "lucide-react"
import Layout from "../components/Layout"

const Profile = () => {
  const { user, getAccessTokenSilently, isAuthenticated } = useAuth0()
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated) return

      try {
        setLoading(true)
        const token = await getAccessTokenSilently()
        const response = await fetch("http://localhost:8000/api/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setUserProfile({
            ...data,
            email: user?.email,
            picture: data.profilePic || user?.picture,
            streak: data.current_streak || 0,
          })
        } else {
          setUserProfile({
            name: user?.name || user?.email?.split("@")[0],
            email: user?.email,
            picture: user?.picture,
            points: 0,
            streak: 0,
            country: "Not set",
            bio: null,
            ethnicity: null,
            sexuality: null,
            religion: null,
          })
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        setUserProfile({
          name: user?.name || user?.email?.split("@")[0],
          email: user?.email,
          picture: user?.picture,
          points: 0,
          streak: 0,
          country: "Not set",
          bio: null,
          ethnicity: null,
          sexuality: null,
          religion: null,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [isAuthenticated, getAccessTokenSilently, user])

  if (loading) {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-16">
            <div className="flex flex-col items-center">
              {userProfile?.picture ? (
                <img
                  src={userProfile.picture}
                  alt={userProfile.name}
                  className="h-24 w-24 rounded-full border-4 border-white mb-4 object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-red-500" />
                </div>
              )}
              <h1 className="text-2xl font-bold text-white">
                {userProfile?.name || user?.email?.split("@")[0]}
              </h1>
              <p className="text-red-100">{userProfile?.email}</p>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                <div className="bg-red-100 rounded-full p-3 mr-4">
                  <Award className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Points</p>
                  <p className="text-xl font-bold">{userProfile?.points || 0}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                <div className="bg-red-100 rounded-full p-3 mr-4">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Current Streak</p>
                  <p className="text-xl font-bold">{userProfile?.streak || 0} days</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                <div className="bg-red-100 rounded-full p-3 mr-4">
                  <User className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Country</p>
                  <p className="text-xl font-bold">{userProfile?.country || "Not set"}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">About You</h2>
              <div className="space-y-2 text-gray-700">
                <p>
                  <span className="font-semibold text-gray-900">Bio: </span>
                  {userProfile?.bio || <span className="italic text-gray-500">Not provided</span>}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Ethnicity: </span>
                  {userProfile?.ethnicity || <span className="italic text-gray-500">Not provided</span>}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Sexuality: </span>
                  {userProfile?.sexuality || <span className="italic text-gray-500">Not provided</span>}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Religion: </span>
                  {userProfile?.religion || <span className="italic text-gray-500">Not provided</span>}
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Link
                to="/profile/settings"
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <Settings className="w-5 h-5 mr-2" />
                Edit Profile Settings
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Profile
