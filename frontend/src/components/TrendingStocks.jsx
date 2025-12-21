import React from 'react'
import './TrendingStocks.css'

/**
 * TrendingStocks Component
 * Displays trending stocks from Reddit with market data
 */
function TrendingStocks({ stocks, onStockClick }) {
  const formatPrice = (price) => {
    if (!price) return 'N/A'
    return `$${parseFloat(price).toFixed(2)}`
  }

  const formatChange = (change, changePercent) => {
    if (!change || !changePercent) return 'N/A'
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`
  }

  const formatMarketCap = (marketCap) => {
    if (!marketCap) return 'N/A'
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
    return `$${marketCap.toFixed(2)}`
  }

  return (
    <div className="trending-stocks">
      <div className="trending-header">
        <h2>📈 Trending on Reddit</h2>
        <p className="trending-subtitle">Top stocks from r/wallstreetbets, r/stocks</p>
      </div>

      {stocks.length === 0 ? (
        <div className="trending-empty">
          <p>No trending stocks available at the moment</p>
          <small>Using default market leaders</small>
        </div>
      ) : (
        <div className="trending-grid">
          {stocks.map((stock) => (
            <div
              key={stock.symbol}
              className="trending-card"
              onClick={() => onStockClick(stock)}
            >
              <div className="trending-card-header">
                <div className="stock-symbol-section">
                  <span className="stock-symbol">{stock.symbol}</span>
                  {stock.redditMentions > 0 && (
                    <span className="reddit-badge" title="Reddit mentions">
                      🔥 {stock.redditMentions}
                    </span>
                  )}
                </div>
                <span className={`stock-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                  {formatChange(stock.change, stock.changePercent)}
                </span>
              </div>

              <div className="trending-card-body">
                <h3 className="stock-name">{stock.name || stock.symbol}</h3>
                <div className="stock-price">{formatPrice(stock.price)}</div>
              </div>

              <div className="trending-card-footer">
                <div className="stock-stat">
                  <span className="stat-label">Market Cap</span>
                  <span className="stat-value">{formatMarketCap(stock.marketCap)}</span>
                </div>
                {stock.redditScore > 0 && (
                  <div className="stock-stat">
                    <span className="stat-label">Social Score</span>
                    <span className="stat-value reddit-score">
                      {stock.redditScore.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TrendingStocks
