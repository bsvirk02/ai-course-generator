import { useAuth0 } from "@auth0/auth0-react"
import { Navigate } from "react-router-dom"

const RequireAuth = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default RequireAuth
