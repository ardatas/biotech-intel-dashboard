import React from 'react'
import { NavLink } from 'react-router-dom'
import './Sidebar.css'

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>📊 Market Intel</h2>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon">📈</span>
          <span className="nav-label">Dashboard</span>
        </NavLink>
        
        <NavLink to="/trending" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon">🔥</span>
          <span className="nav-label">Trending</span>
        </NavLink>
        
        <NavLink to="/discussions" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon">💬</span>
          <span className="nav-label">Discussions</span>
        </NavLink>
        
        <NavLink to="/news" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon">📰</span>
          <span className="nav-label">News</span>
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-section">
          <div className="user-avatar">👤</div>
          <div className="user-info">
            <span className="user-name">Guest User</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
