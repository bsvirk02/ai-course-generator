"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"
import { Menu, X, ChevronDown, User, Award, BookOpen, Home, HelpCircle, LogOut } from "lucide-react"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [backendUser, setBackendUser] = useState(null)
  const { logout, isAuthenticated, user, getAccessTokenSilently } = useAuth0()
  const location = useLocation()

  // fetch the logged in user info
  useEffect(() => {
    const fetchBackendUser = async () => {
      if (!isAuthenticated) return
      try {
        const token = await getAccessTokenSilently()
        const res = await fetch("http://localhost:8000/api/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setBackendUser(data)
      } catch (err) {
        console.error("Failed to fetch backend user:", err)
      }
    }

    fetchBackendUser()
  }, [isAuthenticated, getAccessTokenSilently])
  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const isActive = (path) => {
    return location.pathname === path ? "text-red-600 font-medium" : "text-gray-700 hover:text-red-600"
  }

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin + "/login" } })
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/home" className="flex-shrink-0 flex items-center">
              <span className="text-red-600 text-xl font-bold">DEI Learning</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {isAuthenticated && (
              <>
                <Link to="/home" className={`flex items-center ${isActive("/home")}`}>
                  <Home className="w-4 h-4 mr-1" />
                  <span>Home</span>
                </Link>
                <Link to="/courses" className={`flex items-center ${isActive("/courses")}`}>
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span>Courses</span>
                </Link>
                <Link to="/leaderboard" className={`flex items-center ${isActive("/leaderboard")}`}>
                  <Award className="w-4 h-4 mr-1" />
                  <span>Leaderboard</span>
                </Link>
                <Link to="/users" className={`flex items-center ${isActive("/users")}`}>
                  <User className="w-4 h-4 mr-1" />
                  <span>Users</span>
                </Link>
                <Link to="/groups" className={`flex items-center ${isActive("/groups")}`}>
                  <User className="w-4 h-4 mr-1" />
                  <span>Groups</span>
                </Link>
                {/* only show this option if the logged in user is a manager */}
                {backendUser?.role === "manager" && (
                  <Link
                    to="/assign-group-courses"
                    className="text-sm font-medium text-gray-600 hover:text-red-600"
                  >
                    Assign Groups
                  </Link>
                )}
                <Link to="/faq" className={`flex items-center ${isActive("/faq")}`}>
                  <HelpCircle className="w-4 h-4 mr-1" />
                  <span>FAQ</span>
                </Link>
                <div className="relative group">
                  <button className="flex items-center text-gray-700 hover:text-red-600">
                    <User className="w-4 h-4 mr-1" />
                    <span>Profile</span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      View Profile
                    </Link>
                    <Link to="/profile/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
            {!isAuthenticated && (
              <Link to="/login" className="text-red-600 font-medium">
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-red-600 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAuthenticated && (
              <>
                <Link to="/home" className={`block px-3 py-2 rounded-md ${isActive("/home")}`} onClick={closeMenu}>
                  <div className="flex items-center">
                    <Home className="w-4 h-4 mr-2" />
                    <span>Home</span>
                  </div>
                </Link>
                <Link
                  to="/courses"
                  className={`block px-3 py-2 rounded-md ${isActive("/courses")}`}
                  onClick={closeMenu}
                >
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span>Courses</span>
                  </div>
                </Link>
                <Link
                  to="/leaderboard"
                  className={`block px-3 py-2 rounded-md ${isActive("/leaderboard")}`}
                  onClick={closeMenu}
                >
                  <div className="flex items-center">
                    <Award className="w-4 h-4 mr-2" />
                    <span>Leaderboard</span>
                  </div>
                </Link>
                <Link
                  to="/profile"
                  className={`block px-3 py-2 rounded-md ${isActive("/profile")}`}
                  onClick={closeMenu}
                >
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    <span>Profile</span>
                  </div>
                </Link>
                <Link to="/faq" className={`block px-3 py-2 rounded-md ${isActive("/faq")}`} onClick={closeMenu}>
                  <div className="flex items-center">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    <span>FAQ</span>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    closeMenu()
                  }}
                  className="flex items-center w-full text-left px-3 py-2 rounded-md text-gray-700 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Logout</span>
                </button>
              </>
            )}
            {!isAuthenticated && (
              <Link to="/login" className="block px-3 py-2 rounded-md text-red-600 font-medium" onClick={closeMenu}>
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
