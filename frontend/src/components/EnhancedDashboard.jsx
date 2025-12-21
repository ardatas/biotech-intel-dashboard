import React, { useState, useEffect } from 'react'
import './EnhancedDashboard.css'
import StockDetail from './StockDetail'
import TrendingStocks from './TrendingStocks'
import DiscussionFeed from './DiscussionFeed'
import RecentNews from './RecentNews'
import Footer from './Footer'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * Enhanced Dashboard Component
 * Displays trending stocks with market intelligence
 */
function EnhancedDashboard() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Selected company for detail view
  const [selectedCompany, setSelectedCompany] = useState(null)

  useEffect(() => {
    fetchTrendingStocks()
  }, [])

  const fetchTrendingStocks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_URL}/market/trending`)
      const data = await response.json()
      
      if (data.success) {
        // Transform trending stocks data to match expected company structure
        const transformedCompanies = data.data.map(stock => ({
          symbol: stock.symbol,
          name: stock.name || stock.symbol,
          price: stock.price,
          change: stock.change,
          changePercent: stock.changePercent,
          marketCap: stock.marketCap,
          volume: stock.volume,
          redditMentions: stock.redditMentions || 0,
          redditScore: stock.redditScore || 0
        }))
        
        setCompanies(transformedCompanies)
      } else {
        setError('Failed to fetch trending stocks')
      }
    } catch (err) {
      console.error('Error fetching trending stocks:', err)
      setError('Could not connect to backend. Make sure the server is running.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="enhanced-dashboard">
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading market intelligence...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="enhanced-dashboard">
        <div className="dashboard-error">
          <p>❌ {error}</p>
          <button onClick={fetchTrendingStocks}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="enhanced-dashboard">
        {/* Trending Stocks Section */}
        <TrendingStocks 
          stocks={companies}
          onStockClick={(stock) => setSelectedCompany(stock)}
        />

        {/* Discussion Feed Section */}
        <DiscussionFeed />

        {/* Recent News Section */}
        <RecentNews />

        {/* Stock Detail Panel */}
        {selectedCompany && (
          <StockDetail 
            company={selectedCompany}
            onClose={() => setSelectedCompany(null)}
          />
        )}
      </div>

      {/* Footer */}
      <Footer />
    </>
  )
}

export default EnhancedDashboard
