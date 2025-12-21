import React, { useState, useEffect } from 'react'
import './App.css'
import EnhancedDashboard from './components/EnhancedDashboard'
import Chatbot from './components/Chatbot'

function App() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  
  // Theme state: 'dark' (default) or 'light'
  const [theme, setTheme] = useState(() => {
    // Try to get saved theme from localStorage, default to 'dark'
    const savedTheme = localStorage.getItem('biotech-theme')
    return savedTheme || 'dark'
  })

  // Apply theme to document root and save to localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('biotech-theme', theme)
  }, [theme])

  // Toggle between dark and light themes
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="app">
      <div className="app-layout">
        <div className="main-content">
          <EnhancedDashboard theme={theme} onThemeToggle={toggleTheme} />
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
  )
}

export default App
