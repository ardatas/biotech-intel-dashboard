import React, { useState, useEffect } from 'react'
import './BiotechCompanies.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * BiotechCompanies Component
 * Fetches and displays real-time biotech company data from Yahoo Finance
 */
function BiotechCompanies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [source, setSource] = useState('')

  useEffect(() => {
    fetchBiotechCompanies()
  }, [])

  /**
   * Fetch biotech companies from backend
   */
  const fetchBiotechCompanies = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_URL}/biotech`)
      const data = await response.json()
      
      if (data.success) {
        setCompanies(data.data)
        setSource(data.source)
      } else {
        setError('Failed to fetch companies')
      }
    } catch (err) {
      console.error('Error fetching biotech companies:', err)
      setError('Could not connect to backend. Make sure the server is running.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="biotech-companies">
        <div className="biotech-loading">
          <div className="spinner"></div>
          <p>Loading biotech companies from Yahoo Finance...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="biotech-companies">
        <div className="biotech-error">
          <p>❌ {error}</p>
          <button onClick={fetchBiotechCompanies}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="biotech-companies">
      <div className="biotech-header">
        <h2>🧬 Biotech Companies</h2>
        <div className="biotech-info">
          <span className="company-count">{companies.length} companies</span>
          <span className="data-source">
            Source: {source === 'yahoo_finance' ? '📊 Yahoo Finance (Live)' : '📋 Mock Data'}
          </span>
        </div>
      </div>
      
      <div className="companies-grid">
        {companies.map((company, index) => (
          <div key={`${company.symbol}-${index}`} className="company-card">
            <div className="company-header">
              <div className="company-title">
                <h3>{company.name}</h3>
                <span className="company-ticker">{company.symbol}</span>
              </div>
              <span className="company-exchange">{company.exchange}</span>
            </div>
            
            <div className="company-details">
              <div className="detail-row">
                <span className="detail-label">Industry:</span>
                <span className="detail-value">{company.industry}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Sector:</span>
                <span className="detail-value">{company.sector}</span>
              </div>
              {company.score > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Relevance:</span>
                  <div className="score-bar">
                    <div 
                      className="score-fill" 
                      style={{ width: `${company.score}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BiotechCompanies
