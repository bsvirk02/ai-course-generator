import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { Save, Upload, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import Layout from "../components/Layout"

const ProfileSettings = () => {
  const { user, getAccessTokenSilently, isAuthenticated } = useAuth0()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    ethnicity: "",
    religion: "",
    sexuality: "",
    bio: "",
  })
  const [profileImage, setProfileImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated) return

      try {
        const token = await getAccessTokenSilently()
        const response = await fetch("http://localhost:8000/api/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setFormData({
            name: data.name || "",
            email: user?.email || "",
            country: data.country || "",
            ethnicity: data.ethnicity || "",
            religion: data.religion || "",
            sexuality: data.sexuality || "",
            bio: data.bio || "",
          })
          if (data.profilePic) {
            setPreviewUrl(data.profilePic)
          } else if (user?.picture) {
            setPreviewUrl(user.picture)
          }
        } else {
          console.error("Failed to fetch profile")
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        setError("Failed to load profile data")
      }
    }

    fetchUserProfile()
  }, [isAuthenticated, getAccessTokenSilently, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const token = await getAccessTokenSilently()
      const formDataToSend = new FormData()

      // change all fields except email
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "email") formDataToSend.append(key, value)
      })

      if (profileImage) {
        formDataToSend.append("profile_picture", profileImage)
      }

      const response = await fetch("http://localhost:8000/api/profile/", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("An error occurred while updating your profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/profile" className="inline-flex items-center text-gray-600 hover:text-red-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-6">
            <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
            <p className="text-red-100">Update your personal information</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <p className="text-green-700">Profile updated successfully!</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6 flex flex-col items-center">
                <div className="relative mb-4">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="h-32 w-32 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-xl">No Image</span>
                    </div>
                  )}
                  <label
                    htmlFor="profile_picture"
                    className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full cursor-pointer hover:bg-red-700"
                  >
                    <Upload className="h-4 w-4" />
                  </label>
                </div>
                <input
                  type="file"
                  id="profile_picture"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <label htmlFor="profile_picture" className="text-sm text-gray-500 cursor-pointer hover:text-red-600">
                  Click to upload a new profile picture
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="ethnicity" className="block text-sm font-medium text-gray-700 mb-1">
                    Ethnicity (Optional)
                  </label>
                  <input
                    type="text"
                    id="ethnicity"
                    name="ethnicity"
                    value={formData.ethnicity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="religion" className="block text-sm font-medium text-gray-700 mb-1">
                    Religion (Optional)
                  </label>
                  <input
                    type="text"
                    id="religion"
                    name="religion"
                    value={formData.religion}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="sexuality" className="block text-sm font-medium text-gray-700 mb-1">
                    Sexuality (Optional)
                  </label>
                  <input
                    type="text"
                    id="sexuality"
                    name="sexuality"
                    value={formData.sexuality}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  About Me (Optional)
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="Tell us a bit about yourself..."
                ></textarea>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ProfileSettings
