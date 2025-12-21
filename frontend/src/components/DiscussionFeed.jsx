import React, { useState, useEffect } from 'react'
import './DiscussionFeed.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * DiscussionFeed Component
 * Displays recent Reddit discussions about stocks
 */
function DiscussionFeed({ selectedStock = null }) {
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSubreddit, setSelectedSubreddit] = useState('wallstreetbets')

  const subreddits = [
    { value: 'wallstreetbets', label: 'r/wallstreetbets' },
    { value: 'stocks', label: 'r/stocks' },
    { value: 'investing', label: 'r/investing' },
    { value: 'StockMarket', label: 'r/StockMarket' }
  ]

  useEffect(() => {
    fetchDiscussions()
  }, [selectedSubreddit])

  const fetchDiscussions = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `${API_URL}/market/discussions?subreddit=${selectedSubreddit}&limit=20`
      )
      const data = await response.json()

      if (data.success) {
        setDiscussions(data.data)
      } else {
        setError('Failed to fetch discussions')
      }
    } catch (err) {
      console.error('Error fetching discussions:', err)
      setError('Could not load discussions')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  const openDiscussion = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="discussion-feed">
      <div className="discussion-header">
        <h2>💬 Community Discussions</h2>
        <div className="subreddit-selector">
          {subreddits.map(sub => (
            <button
              key={sub.value}
              className={`subreddit-tab ${selectedSubreddit === sub.value ? 'active' : ''}`}
              onClick={() => setSelectedSubreddit(sub.value)}
            >
              {sub.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="discussion-loading">
          <div className="spinner-small"></div>
          <p>Loading discussions...</p>
        </div>
      ) : error ? (
        <div className="discussion-error">
          <p>❌ {error}</p>
          <button onClick={fetchDiscussions}>Retry</button>
        </div>
      ) : discussions.length === 0 ? (
        <div className="discussion-empty">
          <p>No discussions found</p>
        </div>
      ) : (
        <div className="discussion-list">
          {discussions.map((post, idx) => (
            <div
              key={idx}
              className="discussion-card"
              onClick={() => openDiscussion(post.url)}
            >
              <div className="discussion-content">
                <h3 className="discussion-title">{post.title}</h3>
                {post.tickers && post.tickers.length > 0 && (
                  <div className="discussion-tickers">
                    {post.tickers.slice(0, 5).map((ticker, i) => (
                      <span key={i} className="ticker-tag">${ticker}</span>
                    ))}
                    {post.tickers.length > 5 && (
                      <span className="ticker-more">+{post.tickers.length - 5} more</span>
                    )}
                  </div>
                )}
              </div>

              <div className="discussion-meta">
                <div className="meta-stat">
                  <span className="upvotes">⬆ {formatNumber(post.upvotes)}</span>
                </div>
                <div className="meta-stat">
                  <span className="comments">💬 {formatNumber(post.comments)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DiscussionFeed
