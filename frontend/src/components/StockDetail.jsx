import React, { useState, useEffect } from 'react'
import './StockDetail.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * Stock Detail Component
 * Shows stock information, Reddit sentiment, and news
 */
function StockDetail({ company, onClose }) {
  const [stockData, setStockData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStockIntelligence()
  }, [company.symbol])

  const fetchStockIntelligence = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/stock/${company.symbol}`)
      const data = await response.json()
      
      if (data.success) {
        setStockData(data.data)
      }
    } catch (error) {
      console.error('Error fetching stock intelligence:', error)
    } finally {
      setLoading(false)
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
        
        {loading ? (
          <div className="detail-loading">
            <div className="spinner"></div>
            <p>Loading stock intelligence...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="detail-header">
              <div>
                <h2>{company.name || company.symbol}</h2>
                <p className="detail-subtitle">
                  {company.symbol}
                  {stockData?.price && (
                    <span className="header-price"> • ${parseFloat(stockData.price).toFixed(2)}</span>
                  )}
                </p>
              </div>
              {stockData?.changePercent && (
                <div className={`price-change ${stockData.changePercent >= 0 ? 'positive' : 'negative'}`}>
                  {stockData.changePercent >= 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%
                </div>
              )}
            </div>

            {/* Stock Stats */}
            {stockData && (
              <div className="detail-section">
                <h3>Market Data</h3>
                <div className="info-grid">
                  {stockData.marketCap && (
                    <div className="info-item">
                      <span className="info-label">Market Cap</span>
                      <span className="info-value">
                        {stockData.marketCap >= 1e12 ? `$${(stockData.marketCap / 1e12).toFixed(2)}T` :
                         stockData.marketCap >= 1e9 ? `$${(stockData.marketCap / 1e9).toFixed(2)}B` :
                         `$${(stockData.marketCap / 1e6).toFixed(2)}M`}
                      </span>
                    </div>
                  )}
                  {stockData.yearHigh && (
                    <div className="info-item">
                      <span className="info-label">52W High</span>
                      <span className="info-value">${parseFloat(stockData.yearHigh).toFixed(2)}</span>
                    </div>
                  )}
                  {stockData.yearLow && (
                    <div className="info-item">
                      <span className="info-label">52W Low</span>
                      <span className="info-value">${parseFloat(stockData.yearLow).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reddit Sentiment */}
            {stockData?.socialSentiment && (
              <div className="detail-section">
                <h3>🔥 Social Sentiment</h3>
                <div className="sentiment-grid">
                  <div className="sentiment-card">
                    <span className="sentiment-label">Signal</span>
                    <span className={`sentiment-value signal-${stockData.socialSentiment.signal}`}>
                      {stockData.socialSentiment.signal.toUpperCase()}
                    </span>
                  </div>
                  <div className="sentiment-card">
                    <span className="sentiment-label">Mentions</span>
                    <span className="sentiment-value">{stockData.socialSentiment.mentions}</span>
                  </div>
                  <div className="sentiment-card">
                    <span className="sentiment-label">Engagement</span>
                    <span className="sentiment-value">{stockData.socialSentiment.engagement.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Reddit Discussions */}
            {stockData?.discussions && stockData.discussions.length > 0 && (
              <div className="detail-section">
                <h3>💬 Recent Discussions</h3>
                <div className="discussion-mini-list">
                  {stockData.discussions.map((post, idx) => (
                    <div key={idx} className="discussion-mini-card" onClick={() => window.open(post.url, '_blank')}>
                      <h4>{post.title}</h4>
                      <div className="discussion-stats">
                        <span>⬆ {post.upvotes}</span>
                        <span>💬 {post.comments}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* News Feed */}
            <div className="detail-section">
              <h3>Latest News</h3>
              {stockData?.news && stockData.news.length > 0 ? (
                <div className="news-list">
                  {stockData.news.map((article, index) => (
                    <div key={index} className={`news-item ${isToday(article.publishedAt) ? 'news-today' : ''}`}>
                      <div className="news-header">
                        <h4>
                          {article.title}
                          {isToday(article.publishedAt) && <span className="today-badge">TODAY</span>}
                        </h4>
                        <span className="news-source">{article.publisher}</span>
                      </div>
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
          </>
        )}
      </div>
    </div>
  )
}

export default StockDetail
