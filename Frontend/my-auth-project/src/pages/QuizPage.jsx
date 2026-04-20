import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"
import { CheckCircle, XCircle, AlertTriangle, ArrowLeft } from "lucide-react"
import Layout from "../components/Layout"

const QuizPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { getAccessTokenSilently, isAuthenticated } = useAuth0()

    const [quiz, setQuiz] = useState(null)
    const [answers, setAnswers] = useState({})
    const [submitted, setSubmitted] = useState(false)
    const [score, setScore] = useState(0)
    const [wrongAnswers, setWrongAnswers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentQuestion, setCurrentQuestion] = useState(0)

    useEffect(() => {
	const fetchQuiz = async () => {
	    try {
		setLoading(true)
		const token = await getAccessTokenSilently({
		    audience: "http://127.0.0.1:8000/",
		})

		const res = await fetch(`http://localhost:8000/api/quiz/${id}/`, {
		    headers: {
			Authorization: `Bearer ${token}`,
		    },
		})

		if (!res.ok) {
		    throw new Error(`Failed to fetch quiz: ${res.status}`)
		}

		const data = await res.json()
		setQuiz(data)
	    } catch (err) {
		console.error("Error fetching quiz:", err)
		setError(err.message)
	    } finally {
		setLoading(false)
	    }
	}

	if (isAuthenticated) {
	    fetchQuiz()
	}
    }, [getAccessTokenSilently, id, isAuthenticated])

    const handleChange = (questionId, answerId) => {
	setAnswers((prev) => ({
	    ...prev,
	    [questionId]: answerId,
	}))
    }

    const handleSubmit = async () => {
	if (!quiz) return

	let correctCount = 0
	const wrong = []
	let responseQualities = {}

	quiz.question_trackers.forEach((qt) => {
	    const q = qt.question
	    const selectedId = answers[q.id]
	    const correctAnswer = q.answers.find((a) => a.is_correct)

	    if (selectedId === correctAnswer.id) {
		correctCount += 1
		responseQualities[q.id] = 4;  // estimate (see quiz.models.UserQuestionTracker)
	    } else {
		responseQualities[q.id] = 1;  // ditto
		wrong.push({
		    question: q.question_text,
		    correct: correctAnswer.text,
		    selected: q.answers.find((a) => a.id === selectedId)?.text || "No answer selected",
		})
	    }
	})

	setScore(correctCount)
	setWrongAnswers(wrong)
	setSubmitted(true)

	try {
	    const token = await getAccessTokenSilently({
		audience: "http://127.0.0.1:8000/",
	    });

	    let r=await fetch(`http://localhost:8000/api/quiz/${id}/`, {
		method: "PATCH",
		headers: {
		    "Content-Type": "application/json",
		    Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(responseQualities)
	    });
	    console.log(r)
	} catch (err) {
	    console.error("Error submitting quiz results:", err);
	    setError(err.message)
	}
    }

    const nextQuestion = () => {
	if (currentQuestion < quiz.question_trackers.length - 1) {
	    setCurrentQuestion(currentQuestion + 1)
	}
    }

    const prevQuestion = () => {
	if (currentQuestion > 0) {
	    setCurrentQuestion(currentQuestion - 1)
	}
    }

    const goBack = () => {
	navigate("/courses")
    }

    if (loading) {
	return (
	    <Layout>
		<div className="flex justify-center items-center h-64">
		    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
		</div>
	    </Layout>
	)
    }

    if (error) {
	return (
	    <Layout>
		<div className="max-w-3xl mx-auto px-4 py-8">
		    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
			<div className="flex items-center">
			    <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
			    <p className="text-red-700">Error loading quiz: {error}</p>
			</div>
			<button onClick={goBack} className="mt-4 inline-flex items-center text-red-600 hover:text-red-800">
			    <ArrowLeft className="w-4 h-4 mr-1" />
			    Back to Courses
			</button>
		    </div>
		</div>
	    </Layout>
	)
    }

    if (!quiz) {
	return (
	    <Layout>
		<div className="max-w-3xl mx-auto px-4 py-8">
		    <p>No quiz data available.</p>
		</div>
	    </Layout>
	)
    }

    // console.log(quiz)

    return (
	<Layout>
	    <div className="max-w-3xl mx-auto px-4 py-8">
		<button onClick={goBack} className="mb-6 inline-flex items-center text-gray-600 hover:text-red-600">
		    <ArrowLeft className="w-4 h-4 mr-1" />
		    Back to Courses
		</button>

		<div className="bg-white rounded-lg shadow-md p-6 mb-6">
		    <h1 className="text-2xl font-bold text-gray-800 mb-2">{quiz.title}</h1>
		    <p className="text-gray-600 mb-4">{quiz.description}</p>

		    {!submitted ? (
			<>
			    <div className="mb-6">
				<div className="flex justify-between items-center mb-2">
				    <span className="text-sm font-medium text-gray-500">
					Question {currentQuestion + 1} of {quiz.question_trackers.length}
				    </span>
				    <span className="text-sm font-medium text-gray-500">
					{Math.round(((currentQuestion) / quiz.question_trackers.length) * 100)}% Complete
				    </span>
				</div>
				<div className="w-full bg-gray-200 rounded-full h-2.5">
				    <div
					className="bg-red-600 h-2.5 rounded-full"
					style={{ width: `${((currentQuestion) / quiz.question_trackers.length) * 100}%` }}
				    ></div>
				</div>
			    </div>
			    <div className="mb-8">
				{/* console.log(quiz.question_trackers[currentQuestion]) */}
				<h2 className="text-xl font-semibold mb-4">{quiz.question_trackers[currentQuestion].question.question_text}</h2>
				<div className="space-y-3">
				    {quiz.question_trackers[currentQuestion].question.answers.map((a) => (
					<div
					    key={a.id}
					    className={`border rounded-lg p-4 cursor-pointer transition-colors ${answers[quiz.question_trackers[currentQuestion].question.id] === a.id
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-red-200 hover:bg-red-50"
                        }`}
					    onClick={() => handleChange(quiz.question_trackers[currentQuestion].question.id, a.id)}
					>
					    <div className="flex items-start">
						<div
						    className={`w-5 h-5 rounded-full border flex-shrink-0 mr-3 flex items-center justify-center ${answers[quiz.question_trackers[currentQuestion].question.id] === a.id
                            ? "border-red-500 bg-red-500"
                            : "border-gray-300"
                            }`}
						>
						    {answers[quiz.question_trackers[currentQuestion].id] === a.id && (
							<div className="w-2 h-2 rounded-full bg-white"></div>
						    )}
						</div>
						<span className="text-gray-700">{a.text}</span>
					    </div>
					</div>
				    ))}
				</div>
			    </div>

			    <div className="flex justify-between">
				<button
				    onClick={prevQuestion}
				    disabled={currentQuestion === 0}
				    className={`px-4 py-2 rounded ${currentQuestion === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
				>
				    Previous
				</button>

				{currentQuestion < quiz.question_trackers.length - 1 ? (
				    <button onClick={nextQuestion} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
					Next
				    </button>
				) : (
				    <button onClick={handleSubmit} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
					Submit Quiz
				    </button>
				)}
			    </div>
			</>
		    ) : (
			<div>
			    <div className="bg-gray-50 rounded-lg p-6 mb-6">
				<h2 className="text-xl font-bold mb-4">Quiz Results</h2>
				<div className="flex items-center justify-center mb-6">
				    <div className="text-center">
					<div className="text-4xl font-bold text-red-600 mb-2">
					    {score} / {quiz.question_trackers.length}
					</div>
					<div className="text-gray-600">{Math.round((score / quiz.question_trackers.length) * 100)}% Correct</div>
				    </div>
				</div>

				<div className="w-full bg-gray-200 rounded-full h-4 mb-4">
				    <div
					className="bg-red-600 h-4 rounded-full"
					style={{ width: `${(score / quiz.question_trackers.length) * 100}%` }}
				    ></div>
				</div>
			    </div>

			    {wrongAnswers.length > 0 && (
				<div className="mt-8">
				    <h3 className="text-lg font-semibold mb-4">Review Incorrect Answers</h3>
				    <div className="space-y-6">
					{wrongAnswers.map((item, index) => (
					    <div key={index} className="bg-gray-50 rounded-lg p-4">
						<p className="font-medium mb-2">{item.question}</p>
						<div className="flex items-start mb-2 text-red-600">
						    <XCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
						    <div>
							<span className="font-medium">Your answer: </span>
							<span>{item.selected}</span>
						    </div>
						</div>
						<div className="flex items-start text-green-600">
						    <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
						    <div>
							<span className="font-medium">Correct answer: </span>
							<span>{item.correct}</span>
						    </div>
						</div>
					    </div>
					))}
				    </div>
				</div>
			    )}

			    <div className="mt-8 flex justify-center">
				<button onClick={goBack} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
				    Return to Courses
				</button>
			    </div>
			</div>
		    )}
		</div>
	    </div>
	</Layout>
    )
}

export default QuizPage
