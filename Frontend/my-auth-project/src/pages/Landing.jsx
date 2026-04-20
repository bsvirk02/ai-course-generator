import { useAuth0 } from "@auth0/auth0-react"
import { Link } from "react-router-dom"
import { LogIn, BookOpen, Award, Users, ArrowRight } from "lucide-react"

const Landing = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-red-600 text-xl font-bold">DEI Learning</span>
            </div>
            <div className="flex items-center">
              {isAuthenticated ? (
                <Link
                  to="/home"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              ) : (
                <button
                  onClick={() => loginWithRedirect()}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
              Diversity, Equity, and Inclusion
            </h1>
            <p className="mt-3 max-w-md mx-auto text-xl text-red-100 sm:text-2xl md:mt-5 md:max-w-3xl">
              Empowering workplaces through education and awareness
            </p>
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => loginWithRedirect()}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-red-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Why Choose DEI Learning?</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Our platform offers comprehensive learning resources to help organizations foster inclusive environments.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="flex justify-center">
                  <div className="bg-red-100 rounded-full p-3">
                    <BookOpen className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Interactive Courses</h3>
                <p className="mt-2 text-gray-500">
                  Engaging courses designed by experts to help employees understand and embrace diversity.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="flex justify-center">
                  <div className="bg-red-100 rounded-full p-3">
                    <Award className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Gamified Learning</h3>
                <p className="mt-2 text-gray-500">
                  Earn points, track progress, and compete on leaderboards to make learning fun and engaging.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="flex justify-center">
                  <div className="bg-red-100 rounded-full p-3">
                    <Users className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Team Management</h3>
                <p className="mt-2 text-gray-500">
                  Tools for HR and managers to assign courses, track completion, and measure impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-600 rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-12 md:py-16 md:px-12 text-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Ready to transform your workplace?</h2>
              <p className="mt-4 text-lg leading-6 text-red-100">
                Join thousands of organizations committed to creating inclusive environments.
              </p>
              <div className="mt-8">
                <button
                  onClick={() => loginWithRedirect()}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-red-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Start Learning Today
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <a href="/about-us" className="text-gray-400 hover:text-gray-500">
                About Us
              </a>
              <a href="/contact" className="text-gray-400 hover:text-gray-500">
                Contact
              </a>
              <a href="/privacy-policy" className="text-gray-400 hover:text-gray-500">
                Privacy
              </a>
              <a href="/terms" className="text-gray-400 hover:text-gray-500">
                Terms
              </a>
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
              &copy; {new Date().getFullYear()} DEI Learning. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
