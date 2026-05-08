import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'leaflet/dist/leaflet.css'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { DashboardProvider } from './context/DashboardContext.jsx'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <DashboardProvider>
          <App />
          <Toaster position="top-right" />
        </DashboardProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
