import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

function Logout() {
  const { logout, isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      logout({
        logoutParams: {
          returnTo: "http://localhost:5173/login",
        },
      });
    }
  }, [isAuthenticated, isLoading, logout]);

  if (isLoading) return <p>Logging out...</p>;

  return (
    <div className="container mt-5 text-center">
      {!isAuthenticated ? (
        <div>
          <h1 className="text-danger">You have been logged out</h1>
          <p className="lead">You will be redirected to the login page shortly.</p>
        </div>
      ) : (
        <p>Redirecting...</p>
      )}
    </div>
  );
}

export default Logout;
