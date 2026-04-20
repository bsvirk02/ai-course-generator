"use client"
import { useAuth0 } from "@auth0/auth0-react"
import { LogIn } from "lucide-react"

function Login() {
  const { loginWithRedirect, error, isLoading } = useAuth0()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-2">DEI Learning</h1>
          <p className="text-gray-600 text-lg">Promoting diversity, equity, and inclusion in the workplace</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h2>

          <p className="text-gray-600 mb-6 text-center">
            Please log in to access your account and continue your learning journey.
          </p>

          <button
            onClick={() => loginWithRedirect()}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Login with Auth0
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              <p>Error: {error.message}</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              By logging in, you agree to our{" "}
              <a href="/terms" className="text-red-600 hover:text-red-800">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy-policy" className="text-red-600 hover:text-red-800">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Need help?{" "}
            <a href="/faq" className="text-red-600 hover:text-red-800">
              Visit our FAQ
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
