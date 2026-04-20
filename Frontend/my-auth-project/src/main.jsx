import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import { Auth0Provider } from "@auth0/auth0-react"
import "./index.css"

// Auth0 Credentials
const domain = "dev-y0u2q5ucnabkofu8.us.auth0.com"
const clientId = "2NodUHbGQgIra2MhFXl3sKMUgVZ44eEU"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin + "/home", // After login, redirect here
        audience: "http://127.0.0.1:8000/",
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
)
