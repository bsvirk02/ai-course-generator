import { Link } from "react-router-dom"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-red-600 mb-4">DEI Learning</h3>
            <p className="text-gray-600">
              Promoting diversity, equity, and inclusion in the workplace through education and awareness.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/home" className="text-gray-600 hover:text-red-600">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-gray-600 hover:text-red-600">
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-gray-600 hover:text-red-600">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-red-600">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-gray-600 hover:text-red-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-red-600">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/about-us" className="text-gray-600 hover:text-red-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-red-600">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500">© {currentYear} DEI Learning. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
