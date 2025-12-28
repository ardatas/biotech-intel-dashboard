import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Sidebar from './components/Sidebar'
import Chatbot from './components/Chatbot'
import Dashboard from './pages/Dashboard'
import Trending from './pages/Trending'
import Discussions from './pages/Discussions'
import News from './pages/News'

function App() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  
  // Theme state with localStorage persistence (dark is default)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('biotech-theme') || 'dark'
  })

  // Apply theme to document and save to localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('biotech-theme', theme)
  }, [theme])

  // Toggle between dark and light themes
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Router>
      <div className="app">
        <Sidebar />
        
        <div className="app-layout">
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/trending" element={<Trending />} />
              <Route path="/discussions" element={<Discussions />} />
              <Route path="/news" element={<News />} />
            </Routes>
          </div>
        </div>
        
        {/* Floating Chatbot Popup */}
        {isChatbotOpen && (
          <div className="chatbot-popup">
            <Chatbot onClose={() => setIsChatbotOpen(false)} />
          </div>
        )}
        
        {/* Chatbot Toggle Button */}
        <button 
          className="chatbot-toggle"
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
          aria-label="Toggle AI Assistant"
        >
          {isChatbotOpen ? '✕' : '💬'}
        </button>
      </div>
    </Router>
  )
}

export default App
