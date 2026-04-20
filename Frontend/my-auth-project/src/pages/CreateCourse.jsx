// CreateCourse.jsx
"use client"

import { useState } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { useNavigate } from "react-router-dom"
import { Plus, Minus, Save, ArrowLeft } from "lucide-react"
import Layout from "../components/Layout"

const CreateCourse = () => {
  const navigate = useNavigate()
  const { getAccessTokenSilently } = useAuth0()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    quizzes: [
      {
        title: "",
        description: "",
        questions: [
          {
            question_text: "",
            answers: [
              { text: "", is_correct: true },
              { text: "", is_correct: false },
              { text: "", is_correct: false },
              { text: "", is_correct: false },
            ],
          },
        ],
      },
    ],
  })

  const updateCourseField = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value })
  }

  const updateQuizField = (e, quizIndex) => {
    const quizzes = [...courseData.quizzes]
    quizzes[quizIndex][e.target.name] = e.target.value
    setCourseData({ ...courseData, quizzes })
  }

  const updateQuestionField = (e, quizIndex, questionIndex) => {
    const quizzes = [...courseData.quizzes]
    quizzes[quizIndex].questions[questionIndex][e.target.name] = e.target.value
    setCourseData({ ...courseData, quizzes })
  }

  const updateAnswerField = (e, quizIndex, questionIndex, answerIndex) => {
    const quizzes = [...courseData.quizzes]
    const answers = quizzes[quizIndex].questions[questionIndex].answers
    if (e.target.name === "is_correct") {
      answers.forEach((a, i) => (a.is_correct = i === answerIndex))
    } else {
      answers[answerIndex][e.target.name] = e.target.value
    }
    setCourseData({ ...courseData, quizzes })
  }

  const addQuiz = () => {
    setCourseData({
      ...courseData,
      quizzes: [
        ...courseData.quizzes,
        {
          title: "",
          description: "",
          questions: [
            {
              question_text: "",
              answers: [
                { text: "", is_correct: true },
                { text: "", is_correct: false },
                { text: "", is_correct: false },
                { text: "", is_correct: false },
              ],
            },
          ],
        },
      ],
    })
  }

  const removeQuiz = (index) => {
    if (courseData.quizzes.length <= 1) return
    setCourseData({
      ...courseData,
      quizzes: courseData.quizzes.filter((_, i) => i !== index),
    })
  }

  const addQuestion = (quizIndex) => {
    const quizzes = [...courseData.quizzes]
    quizzes[quizIndex].questions.push({
      question_text: "",
      answers: [
        { text: "", is_correct: true },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
      ],
    })
    setCourseData({ ...courseData, quizzes })
  }

  const removeQuestion = (quizIndex, questionIndex) => {
    const quizzes = [...courseData.quizzes]
    if (quizzes[quizIndex].questions.length <= 5) return
    quizzes[quizIndex].questions.splice(questionIndex, 1)
    setCourseData({ ...courseData, quizzes })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = await getAccessTokenSilently()
      const res = await fetch("http://localhost:8000/api/create_course/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Course creation failed")
      }

      navigate("/courses")
    } catch (err) {
      console.error("Submit Error:", err)
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <button onClick={() => navigate("/courses")} className="mb-4 text-red-500">
          <ArrowLeft className="inline mr-1" /> Back to Courses
        </button>

        <h1 className="text-2xl font-bold mb-6">Create New Course</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              name="title"
              placeholder="Course Title"
              value={courseData.title}
              onChange={updateCourseField}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <textarea
              name="description"
              placeholder="Course Description"
              value={courseData.description}
              onChange={updateCourseField}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>

          {courseData.quizzes.map((quiz, quizIndex) => (
            <div key={quizIndex} className="border p-4 rounded space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">Quiz {quizIndex + 1}</h2>
                <button onClick={() => removeQuiz(quizIndex)} type="button">
                  <Minus /> Remove Quiz
                </button>
              </div>
              <input
                type="text"
                name="title"
                placeholder="Quiz Title"
                value={quiz.title}
                onChange={(e) => updateQuizField(e, quizIndex)}
                className="w-full p-2 border rounded"
                required
              />
              <textarea
                name="description"
                placeholder="Quiz Description"
                value={quiz.description}
                onChange={(e) => updateQuizField(e, quizIndex)}
                className="w-full p-2 border rounded"
                rows={2}
              />

              {quiz.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="space-y-2">
                  <input
                    type="text"
                    name="question_text"
                    placeholder="Question text"
                    value={question.question_text}
                    onChange={(e) => updateQuestionField(e, quizIndex, questionIndex)}
                    className="w-full p-2 border rounded"
                    required
                  />

                  {question.answers.map((answer, answerIndex) => (
                    <div key={answerIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`correct-${quizIndex}-${questionIndex}`}
                        checked={answer.is_correct}
                        onChange={(e) =>
                          updateAnswerField(e, quizIndex, questionIndex, answerIndex)
                        }
                      />
                      <input
                        type="text"
                        name="text"
                        placeholder={`Answer ${answerIndex + 1}`}
                        value={answer.text}
                        onChange={(e) =>
                          updateAnswerField(e, quizIndex, questionIndex, answerIndex)
                        }
                        className="flex-grow p-2 border rounded"
                        required
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => removeQuestion(quizIndex, questionIndex)}
                    className="text-sm text-red-600 mt-1"
                  >
                    <Minus className="inline w-4 h-4" /> Remove Question
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addQuestion(quizIndex)}
                className="text-sm text-blue-600"
              >
                <Plus className="inline w-4 h-4" /> Add Question
              </button>
            </div>
          ))}

          <div className="flex justify-between">
            <button type="button" onClick={addQuiz} className="text-blue-500">
              <Plus className="inline w-5 h-5" /> Add Quiz
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            >
              {loading ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default CreateCourse
