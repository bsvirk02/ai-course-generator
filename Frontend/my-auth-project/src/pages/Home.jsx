import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth0 } from "@auth0/auth0-react"
import { ChevronLeft, ChevronRight, Clock, Calendar, ExternalLink } from "lucide-react"
import Layout from "../components/Layout"

function Home() {
  const [message, setMessage] = useState("")
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [assignments, setAssignments] = useState([])

  const { isAuthenticated, getAccessTokenSilently, isLoading, user } = useAuth0()

  useEffect(() => {
    const fetchHomeData = async () => {
      if (!isAuthenticated) return

      try {
        setLoading(true)
        const token = await getAccessTokenSilently()
        const response = await axios.get("http://localhost:8000/api/home/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setMessage(response.data.message)
      } catch (error) {
        console.error("Error fetching home data:", error)
        setMessage("Welcome to DEI Learning!")
      } finally {
        setLoading(false)
      }
    }

    fetchHomeData()
  }, [isAuthenticated, getAccessTokenSilently])

  useEffect(() => {
    const fetchCulturalNews = async () => {
      if (!isAuthenticated) return

      try {
        const token = await getAccessTokenSilently()
        const response = await axios.get("http://localhost:8000/api/cultural_news/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setNews(response.data?.articles || [])
      } catch (error) {
        console.error("Error fetching cultural news:", error)
      }
    }

    fetchCulturalNews()
  }, [isAuthenticated, getAccessTokenSilently])

  // WebSocket connection for course deadlines
  useEffect(() => {
    if (!isAuthenticated || !user) return

    const userId = user.sub?.split("|")[1] || user.sub
    const ws = new WebSocket(`ws://localhost:8000/ws/assignments/${userId}/`)

    ws.onopen = () => {
      console.log("WebSocket connected")
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.assignment) {
        setAssignments(data.assignment)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
    }

    ws.onclose = () => {
      console.log("WebSocket disconnected")
    }

    return () => {
      ws.close()
    }
  }, [isAuthenticated, user])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === news.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? news.length - 1 : prev - 1))
  }

  if (isLoading) {
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
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-8 mb-10 shadow-sm">
          <h1 className="text-3xl font-bold text-red-600 mb-4">{message}</h1>
          <p className="text-gray-700 text-lg">
            Explore our courses on diversity, equity, and inclusion to enhance your workplace knowledge and skills.
          </p>
        </div>

        {/* Upcoming Deadlines Section */}
        {assignments.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Upcoming Deadlines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map((assignment, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
                  <h3 className="font-semibold text-lg mb-2">{assignment.course}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{new Date(assignment.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-red-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{assignment.time_remaining}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Latest Cultural News */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Latest Cultural News</h2>

        {news.length > 0 ? (
          <div className="relative">
            <div className="overflow-hidden rounded-xl shadow-lg">
              <div className="relative">
                {news[currentSlide].urlToImage ? (
                  <img
                    src={news[currentSlide].urlToImage || "/placeholder.svg"}
                    alt={news[currentSlide].title}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h3 className="text-white text-xl font-bold mb-2">{news[currentSlide].title}</h3>
                </div>
              </div>
              <div className="bg-white p-6">
                <p className="text-gray-700 mb-4">{news[currentSlide].description}</p>
                <a
                  href={news[currentSlide].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-red-600 hover:text-red-800"
                >
                  Read more
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>

            {/* Navigation buttons */}
            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>

            {/* Dots indicator */}
            <div className="flex justify-center mt-4">
              {news.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 w-2 mx-1 rounded-full ${currentSlide === index ? "bg-red-600" : "bg-gray-300"}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600">
              {news.length === 0 ? "No cultural news available at the moment." : "Fetching cultural news..."}
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Home
