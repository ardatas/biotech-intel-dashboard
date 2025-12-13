import React from 'react'
import './Footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="dashboard-footer">
      <div className="footer-content">
        <div className="footer-section">
          <span className="footer-text">© {currentYear} Biotech Intelligence</span>
        </div>
        
        <div className="footer-divider"></div>
        
        <div className="footer-section">
          <span className="footer-text">Market Intelligence Platform</span>
        </div>
        
        <div className="footer-divider"></div>
        
        <div className="footer-section">
          <span className="footer-text">Data updated periodically</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
