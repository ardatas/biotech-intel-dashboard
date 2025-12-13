import React, { useState } from 'react'
import './Chatbot.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    const currentInput = input
    setMessages([...messages, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Call backend /ask endpoint
      const response = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput })
      })

      const data = await response.json()
      
      if (data.success) {
        const assistantMessage = { role: 'assistant', content: data.response }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        const errorMessage = { 
          role: 'assistant', 
          content: data.error || 'Sorry, there was an error.' 
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage = { 
        role: 'assistant', 
        content: 'Could not connect to backend. Make sure the server is running.' 
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chatbot">
      <div className="chatbot-header">
        <h2>💬 AI Assistant</h2>
        {onClose && (
          <button className="chatbot-close" onClick={onClose}>
            ✕
          </button>
        )}
      </div>
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>Ask me anything about biotech investments!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              {msg.content}
            </div>
          ))
        )}
        {loading && <div className="message assistant">Thinking...</div>}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your question..."
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  )
}

export default Chatbot
