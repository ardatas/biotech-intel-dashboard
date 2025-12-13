import React, { useState, useEffect } from 'react'
import './CompanyDetail.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * Company Detail Component
 * Shows company information and AI-summarized news
 */
function CompanyDetail({ company, onClose }) {
  const [news, setNews] = useState([])
  const [loadingNews, setLoadingNews] = useState(true)

  useEffect(() => {
    fetchNews()
  }, [company.symbol])

  const fetchNews = async () => {
    try {
      setLoadingNews(true)
      const response = await fetch(`${API_URL}/news?symbol=${company.symbol}`)
      const data = await response.json()
      
      if (data.success) {
        setNews(data.data)
      }
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoadingNews(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const isToday = (dateString) => {
    if (!dateString) return false
    const date = new Date(dateString)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="company-detail-overlay" onClick={onClose}>
      <div className="company-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        {/* Header */}
        <div className="detail-header">
          <div>
            <h2>{company.name}</h2>
            <p className="detail-subtitle">
              {company.symbol} • {company.exchange}
            </p>
          </div>
        </div>

        {/* Company Info */}
        <div className="detail-section">
          <h3>Company Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Primary Sector</span>
              <span className="info-value sector-primary">
                {company.primarySector || company.sector}
              </span>
            </div>
            {company.secondarySectors && company.secondarySectors.length > 0 && (
              <div className="info-item full-width">
                <span className="info-label">Related Sectors</span>
                <div className="secondary-sectors">
                  {company.secondarySectors.map((sector, idx) => (
                    <span key={idx} className="sector-badge secondary">
                      {sector}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="info-item">
              <span className="info-label">Industry</span>
              <span className="info-value">{company.industry}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Type</span>
              <span className="info-value">{company.quoteType}</span>
            </div>
          </div>
          
          {/* Match Reasons */}
          {company.matchReasons && company.matchReasons.length > 0 && (
            <div className="match-reasons">
              <h4>Why This Company Matches</h4>
              <div className="match-badges">
                {company.matchReasons.map((reason, idx) => (
                  <span key={idx} className="match-badge">
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* News Feed */}
        <div className="detail-section">
          <h3>Latest News</h3>
          {loadingNews ? (
            <div className="section-loading">Loading news...</div>
          ) : news.length > 0 ? (
            <div className="news-list">
              {news.map((article, index) => (
                <div key={index} className={`news-item ${isToday(article.publishedAt) ? 'news-today' : ''}`}>
                  <div className="news-header">
                    <h4>
                      {article.title}
                      {isToday(article.publishedAt) && <span className="today-badge">TODAY</span>}
                    </h4>
                    <span className="news-source">{article.source}</span>
                  </div>
                  {article.aiSummary && article.aiSummary !== 'No summary available' && (
                    <p className="news-summary">{article.aiSummary}</p>
                  )}
                  <div className="news-footer">
                    <span className="news-date">{formatDate(article.publishedAt)}</span>
                    {article.link && (
                      <a href={article.link} target="_blank" rel="noopener noreferrer" className="news-link">
                        Read more →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="section-empty">No recent news available</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CompanyDetail
