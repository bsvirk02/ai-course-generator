import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import Layout from "../components/Layout"

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const faqItems = [
    {
      question: "What is DEI Learning?",
      answer:
        "DEI Learning is an educational platform focused on Diversity, Equity, and Inclusion in the workplace. We provide interactive courses, quizzes, and resources to help organizations foster more inclusive environments.",
    },
    {
      question: "How do I get started with the courses?",
      answer:
        "After logging in, navigate to the Courses page where you'll find all available courses. Click on a course to view its quizzes and start learning. Your progress will be automatically tracked.",
    },
    {
      question: "How does the points system work?",
      answer:
        "You earn points by completing quizzes and courses. The more questions you answer correctly, the more points you earn. These points contribute to your ranking on the leaderboard and help track your progress.",
    },
    {
      question: "Can I track my team's progress?",
      answer:
        "Yes, if you have a manager or HR role, you can create groups, assign courses to them, and track their progress and completion rates through the dashboard.",
    },
    {
      question: "How often is new content added?",
      answer:
        "We regularly update our content library with new courses and quizzes. We also feature current news related to DEI topics on the home page to keep you informed about the latest developments.",
    },
    {
      question: "Is my personal information secure?",
      answer:
        "Yes, we take data security seriously. We use Auth0 for authentication and follow best practices for data protection. Your personal information is encrypted and never shared with third parties without your consent.",
    },
    {
      question: "How can I update my profile information?",
      answer:
        "You can update your profile information by going to your Profile page and clicking on 'Edit Profile Settings'. There you can change your name, country, and other personal details.",
    },
    {
      question: "What if I forget my password?",
      answer:
        "Since we use Auth0 for authentication, you can reset your password through the login page by clicking on the 'Forgot Password' link and following the instructions sent to your email.",
    },
  ]

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-600">Find answers to common questions about our platform and services.</p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleQuestion(index)}
              >
                <span className="text-lg font-medium text-gray-800">{item.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-red-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-red-50 rounded-lg p-6 border border-red-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Still have questions?</h2>
          <p className="text-gray-600 mb-4">
            If you couldn't find the answer to your question, please feel free to contact our support team.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </Layout>
  )
}

export default FAQ
