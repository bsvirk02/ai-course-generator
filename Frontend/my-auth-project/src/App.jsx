import "bootstrap/dist/css/bootstrap.min.css"
import RequireAuth from "./components/RequireAuth"
import { BrowserRouter, Routes, Route } from "react-router-dom"

// Pages
import Landing from "./pages/Landing"
import Home from "./pages/Home"
import Login from "./pages/Login"
import PrivacyPolicy from "./pages/PrivacyPolicy"
import TermsOfService from "./pages/TermsOfService"
import AboutUs from "./pages/AboutUs"
import ContactUs from "./pages/ContactUs"
import FAQ from "./pages/FAQ"
import Dashboard from "./pages/Dashboard"
import NotFound from "./pages/NotFound"
import Leaderboard from "./pages/Leaderboard"
import Courses from "./pages/Courses"
import Profile from "./pages/Profile"
import ProfileSettings from "./pages/ProfileSettings"
import Logout from "./pages/Logout"
import QuizPage from "./pages/QuizPage"
import CreateCourse from "./pages/CreateCourse"
import AIGenerateCourse from "./pages/AIGenerateCourse" // Add this import
import Users from "./pages/ViewUsers"
import AssignGroupCourses from "./pages/AssignGroupCourse"
import Groups from "./pages/Groups"
import CourseQuizPage from "./pages/CourseQuizPage"

const App = () => {
    return (
	<BrowserRouter>
	    <Routes>
		{/* Public Pages */}
		<Route path="/" element={<Landing />} />
		<Route path="/login" element={<Login />} />
		<Route path="/privacy-policy" element={<PrivacyPolicy />} />
		<Route path="/terms" element={<TermsOfService />} />
		<Route path="/about-us" element={<AboutUs />} />
		<Route path="/contact" element={<ContactUs />} />
		<Route path="/faq" element={<FAQ />} />

        {/* Protected Pages */}
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <RequireAuth>
              <Leaderboard />
            </RequireAuth>
          }
        />
        <Route
          path="/courses"
          element={
            <RequireAuth>
              <Courses />
            </RequireAuth>
          }
        />
        <Route
          path="/create-course"
          element={
            <RequireAuth>
              <CreateCourse />
            </RequireAuth>
          }
        />
        {/* Add the new AI Generate Course route */}
        <Route
          path="/generate-course"
          element={
            <RequireAuth>
              <AIGenerateCourse />
            </RequireAuth>
          }
        />
        <Route
          path="/users"
          element={
            <RequireAuth>
              <Users />
            </RequireAuth>
          }
        />
        <Route
          path="/courses/:courseId/quiz"
          element={
            <RequireAuth>
              <CourseQuizPage />
            </RequireAuth>
          }
        />
        <Route
          path="/assign-group-courses"
          element={
            <RequireAuth>
              <AssignGroupCourses />
            </RequireAuth>
          }
        />
        <Route
          path="/groups"
          element={
            <RequireAuth>
              <Groups />
            </RequireAuth>
          }
        />
        <Route
          path="/quiz/:id"
          element={
            <RequireAuth>
              <QuizPage />
            </RequireAuth>
          }
        />

		<Route
		    path="/profile"
		    element={
			<RequireAuth>
			    <Profile />
			</RequireAuth>
		    }
		/>
		<Route
		    path="/profile/settings"
		    element={
			<RequireAuth>
			    <ProfileSettings />
			</RequireAuth>
		    }
		/>
		<Route
		    path="/logout"
		    element={
			<RequireAuth>
			    <Logout />
			</RequireAuth>
		    }
		/>

		{/* 404 Page */}
		<Route path="*" element={<NotFound />} />
	    </Routes>
	</BrowserRouter>
    )
}

export default App