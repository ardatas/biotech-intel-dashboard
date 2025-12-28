import React from 'react'
import './Footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="dashboard-footer">
      <div className="footer-content">
        <div className="footer-section">
          <span className="footer-text">© {currentYear} </span>
        </div>
        
        <div className="footer-divider"></div>
        
        <div className="footer-section">
          <span className="footer-text">Market Intelligence Platform</span>
        </div>
      </div>
      
      <div className="footer-disclaimer">
        <p>⚠️ This application is for informational and educational purposes only. Not financial advice. Consult a qualified financial advisor before making investment decisions.</p>
      </div>
    </footer>
  )
}

export default Footer
