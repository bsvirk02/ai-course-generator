"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

const AssignmentCard = ({ assignment }) => {
  const [timeRemaining, setTimeRemaining] = useState("")
  const [statusColor, setStatusColor] = useState("text-green-600")
  const navigate = useNavigate()

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date()
      const deadlineDate = new Date(assignment.deadline)
      const timeRemaining = deadlineDate - now

      if (timeRemaining <= 0) {
        setTimeRemaining("Overdue")
        setStatusColor("text-red-600")
        return
      }

      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
      const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`)
      }

      if (timeRemaining <= 24 * 60 * 60 * 1000) {
        setStatusColor("text-red-600")
      } else if (timeRemaining <= 3 * 24 * 60 * 60 * 1000) {
        setStatusColor("text-orange-500")
      } else if (timeRemaining <= 7 * 24 * 60 * 60 * 1000) {
        setStatusColor("text-yellow-500")
      } else {
        setStatusColor("text-green-600")
      }
    }

    calculateTimeRemaining()
    const timer = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(timer)
  }, [assignment.deadline])

  const handleClick = () => {
    navigate(`/courses/${assignment.courseId}`)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <h3 className="font-semibold text-lg mb-2">{assignment.course}</h3>
      <div className="flex items-center text-gray-600 mb-3">
        <Calendar className="w-4 h-4 mr-2" />
        <span>{new Date(assignment.deadline).toLocaleDateString()}</span>
      </div>
      <div className={`flex items-center ${statusColor} mb-4 font-medium`}>
        <Clock className="w-4 h-4 mr-2" />
        <span>{timeRemaining}</span>
      </div>
      <button
        onClick={handleClick}
        className="w-full mt-2 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        Start Course
        <ArrowRight className="ml-2 h-4 w-4" />
      </button>
    </div>
  )
}

export default AssignmentCard
