import React from "react"
import ReactDOM from "react-dom/client"
import Studio from "./Studio.tsx"
import "./index.css"
import { StudioTelemetryProvider } from "./StudioTelemetryProvider.tsx"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <StudioTelemetryProvider>
      <Studio />
    </StudioTelemetryProvider>
  </React.StrictMode>
)
