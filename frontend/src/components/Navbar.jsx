import React from 'react'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>📊 Market Intelligence Platform</h1>
      </div>
      <div className="navbar-menu">
        <a href="#deals">Deals</a>
        <a href="#companies">Companies</a>
        <a href="#analytics">Analytics</a>
      </div>
    </nav>
  )
}

export default Navbar
