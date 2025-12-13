import React, { useState } from 'react'
import './App.css'
import EnhancedDashboard from './components/EnhancedDashboard'
import Chatbot from './components/Chatbot'

function App() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  return (
    <div className="app">
      <div className="app-layout">
        <div className="main-content">
          <EnhancedDashboard />
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
      
      {/* Disclaimer Footer */}
      <footer className="disclaimer-footer">
        <p>⚠️ This application is for informational and educational purposes only. Not financial advice.</p>
      </footer>
    </div>
  )
}

export default App
