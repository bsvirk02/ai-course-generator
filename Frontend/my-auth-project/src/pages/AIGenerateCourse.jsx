// Frontend/my-auth-project/src/pages/AIGenerateCourse.jsx
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const AIGenerateCourse = () => {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generationStep, setGenerationStep] = useState(0);
  const [courseId, setCourseId] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGenerationStep(1);

    try {
      const token = await getAccessTokenSilently({
        audience: "http://127.0.0.1:8000/",
      });
      
      // First update to show progress
      const progressTimer = setTimeout(() => setGenerationStep(2), 2000);
      
      const response = await fetch("http://localhost:8000/api/generate_course/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic,
          description,
          retry_count: retryCount, // Send retry count to backend
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        clearTimeout(progressTimer);
        throw new Error(data.error || "Failed to generate course");
      }

      setCourseId(data.course_id);
      setGenerationStep(3); // Complete step
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error("Error generating course:", err);
      setError(err.message);
      setGenerationStep(0);
      
      // Increment retry count for next attempt
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    // Reset error but keep the form data
    setError(null);
    handleSubmit({ preventDefault: () => {} });
  };

  const renderStepIndicator = () => {
    const steps = [
      "Enter Course Details",
      "Generating Course Structure",
      "Creating Quiz Questions",
      "Course Created",
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col items-center ${
                index <= generationStep ? "text-red-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  index <= generationStep ? "bg-red-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {index < generationStep ? "✓" : index + 1}
              </div>
              <span className="text-xs text-center">{step}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 h-1 w-full bg-gray-200">
          <div
            className="h-1 bg-red-600 transition-all duration-500"
            style={{ width: `${(generationStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Helper function to provide tips based on error message
  const getErrorTips = (errorMessage) => {
    if (errorMessage.includes("parse")) {
      return (
        <ul className="list-disc pl-5 mt-2 text-sm">
          <li>Try using a more specific topic</li>
          <li>Keep your description concise and clear</li>
          <li>The AI sometimes needs a few attempts to generate valid content</li>
        </ul>
      );
    }
    return null;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">AI Course Generator</h1>
        <p className="text-gray-600 mb-8">
          Create a new DEI course using AI. Simply enter a topic and description, and our AI will
          generate a complete course with quizzes.
        </p>

        {renderStepIndicator()}

        {generationStep < 3 ? (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <label htmlFor="topic" className="block text-gray-700 font-medium mb-2">
                Course Topic
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="e.g., Gender Inclusivity in the Workplace"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                Course Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 h-32"
                placeholder="Provide a brief description of what this course should cover..."
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Tip: For best results, provide a clear and specific description (2-3 sentences).
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                <p className="font-medium">{error}</p>
                {getErrorTips(error)}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="text-sm font-medium text-red-700 hover:text-red-800"
                    disabled={loading}
                  >
                    Try again with the same details
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/courses")}
                className="px-4 py-2 text-gray-700 mr-2"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-300"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {generationStep === 1 ? "Analyzing topic..." : "Generating course..."}
                  </span>
                ) : (
                  "Generate Course"
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Course Generated Successfully!</h2>
              <p className="text-gray-600">
                Your course "{topic}" has been created and is now available in the courses list.
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate("/courses")}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                View All Courses
              </button>
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                View This Course
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AIGenerateCourse;