import React, { useState, useEffect } from 'react'
import './RecentNews.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function RecentNews() {
  const [recentNews, setRecentNews] = useState([])
  const [pastNews, setPastNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPastNews, setShowPastNews] = useState(false)
  const [expandedItem, setExpandedItem] = useState(null)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch recent and past news in parallel
      const [recentResponse, pastResponse] = await Promise.all([
        fetch(`${API_URL}/news/recent`),
        fetch(`${API_URL}/news/past`)
      ])

      const recentData = await recentResponse.json()
      const pastData = await pastResponse.json()

      if (recentData.success) {
        setRecentNews(recentData.data)
      }
      if (pastData.success) {
        setPastNews(pastData.data)
      }
    } catch (err) {
      console.error('Error fetching news:', err)
      setError('Failed to load news')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const handleNewsClick = (article, index) => {
    // Toggle expansion
    if (expandedItem === index) {
      setExpandedItem(null)
    } else {
      setExpandedItem(index)
    }
  }

  const openArticle = (link, e) => {
    e.stopPropagation()
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className="recent-news">
        <div className="news-header">
          <h2>Recent News</h2>
        </div>
        <div className="news-loading">
          <div className="news-spinner"></div>
          <p>Loading news...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="recent-news">
        <div className="news-header">
          <h2>Recent News</h2>
        </div>
        <div className="news-error">
          <p>⚠️ {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="recent-news">
      <div className="news-header">
        <h2>Recent News</h2>
        <span className="news-count">{recentNews.length} articles</span>
      </div>

      {/* Recent News Items */}
      <div className="news-items">
        {recentNews.map((article, index) => (
          <div 
            key={index} 
            className={`news-item ${expandedItem === index ? 'expanded' : ''}`}
            onClick={() => handleNewsClick(article, index)}
          >
            <div className="news-item-header">
              <div className="news-item-title-row">
                <h3 className="news-item-title">{article.title}</h3>
                {article.isRelevantTo2NAFISH && (
                  <span className="relevance-tag" title="Relevant to cancer diagnostics, RNA, spatial transcriptomics">
                    🔬 Relevant
                  </span>
                )}
              </div>
              <div className="news-item-meta">
                <span className="news-source">{article.source}</span>
                <span className="news-divider">•</span>
                <span className="news-company">{article.companySymbol}</span>
                <span className="news-divider">•</span>
                <span className="news-time">{formatDate(article.publishedAt)}</span>
              </div>
            </div>
            
            {expandedItem === index && (
              <div className="news-item-expanded">
                <p className="news-summary">{article.summary}</p>
                <button 
                  className="news-read-more"
                  onClick={(e) => openArticle(article.link, e)}
                >
                  Read Full Article →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Past News Section */}
      {pastNews.length > 0 && (
        <div className="past-news-section">
          <button 
            className="past-news-toggle"
            onClick={() => setShowPastNews(!showPastNews)}
          >
            <span>Past News ({pastNews.length})</span>
            <span className={`toggle-icon ${showPastNews ? 'open' : ''}`}>▼</span>
          </button>

          {showPastNews && (
            <div className="past-news-items">
              {pastNews.map((article, index) => (
                <div 
                  key={index} 
                  className="past-news-item"
                  onClick={() => openArticle(article.link, { stopPropagation: () => {} })}
                >
                  <div className="past-news-content">
                    <h4 className="past-news-title">{article.title}</h4>
                    <div className="past-news-meta">
                      <span className="news-source">{article.source}</span>
                      <span className="news-divider">•</span>
                      <span className="news-company">{article.companySymbol}</span>
                      <span className="news-divider">•</span>
                      <span className="news-time">{formatDate(article.publishedAt)}</span>
                    </div>
                  </div>
                  <span className="past-news-arrow">→</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RecentNews
