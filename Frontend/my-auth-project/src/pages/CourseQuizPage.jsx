import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"
import Layout from "../components/Layout"

const CourseQuizPage = () => {
    const { courseId } = useParams()
    const { getAccessTokenSilently, isAuthenticated } = useAuth0()
    const [quizData, setQuizData] = useState(null)
    const [answers, setAnswers] = useState({})
    const [submitted, setSubmitted] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchQuiz = async () => {
            const token = await getAccessTokenSilently()
            const res = await fetch(`http://localhost:8000/api/course/${courseId}/quiz/`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (!res.ok) {
                console.error("Failed to fetch quiz")
                return
            }

            const data = await res.json()
            setQuizData(data)
        }

        if (isAuthenticated) {
            fetchQuiz()
        }
    }, [courseId, getAccessTokenSilently, isAuthenticated])

    const handleAnswer = (questionId, answerId) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answerId }))
    }

    const handleSubmit = async () => {
        const token = await getAccessTokenSilently()

        const res = await fetch(`http://localhost:8000/api/course/${courseId}/quiz/submit/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ answers }),
        })

        if (res.ok) {
            setSubmitted(true)
            alert("Quiz submitted successfully!")
            navigate("/groups")
        } else {
            const error = await res.json()
            console.error("Submission error:", error)
        }
    }

    if (!quizData) return <Layout>Loading quiz...</Layout>

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-4 text-gray-800">{quizData.title}</h1>

                {quizData.questions.map((q) => (
                    <div key={q.id} className="mb-6">
                        <p className="font-semibold">{q.question_text}</p>
                        <div className="space-y-2 mt-2">
                            {q.answers.map((a) => (
                                <label key={a.id} className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name={`question-${q.id}`}
                                        value={a.id}
                                        checked={answers[q.id] === a.id}
                                        onChange={() => handleAnswer(q.id, a.id)}
                                        disabled={submitted}
                                    />
                                    <span>{a.text}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}

                {!submitted && (
                    <button
                        onClick={handleSubmit}
                        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Submit Quiz
                    </button>
                )}
            </div>
        </Layout>
    )
}

export default CourseQuizPage
