import React, { useState, useEffect } from 'react'
import './Dashboard.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function Dashboard({ filters }) {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch deals from backend on component mount
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_URL}/deals`)
        const data = await response.json()
        
        if (data.success) {
          setDeals(data.data)
        } else {
          setError('Failed to fetch deals')
        }
      } catch (err) {
        console.error('Error fetching deals:', err)
        setError('Could not connect to backend')
      } finally {
        setLoading(false)
      }
    }

    fetchDeals()
  }, [])
  // Filter deals based on filters
  const filteredDeals = deals.filter(deal => {
    const matchesStage = filters.stage === 'all' || deal.stage === filters.stage
    const matchesSector = filters.sector === 'all' || deal.sector === filters.sector
    const matchesSearch = deal.company.toLowerCase().includes(filters.searchTerm.toLowerCase())
    return matchesStage && matchesSector && matchesSearch
  })

  if (loading) {
    return (
      <div className="dashboard">
        <h2>Investment Deals</h2>
        <div className="loading">Loading deals...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard">
        <h2>Investment Deals</h2>
        <div className="error">{error}</div>
      </div>
    )
  }

  // Calculate stats
  const totalDeals = filteredDeals.length
  const totalAmount = filteredDeals.reduce((sum, deal) => {
    const amount = parseInt(deal.amount.replace(/[$M]/g, ''))
    return sum + amount
  }, 0)
  const avgDeal = totalDeals > 0 ? Math.round(totalAmount / totalDeals) : 0

  return (
    <div className="dashboard">
      <h2>Investment Deals</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalDeals}</div>
          <div className="stat-label">Total Deals</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">${totalAmount}M</div>
          <div className="stat-label">Total Amount</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">${avgDeal}M</div>
          <div className="stat-label">Avg Deal Size</div>
        </div>
      </div>

      <div className="deals-list">
        {filteredDeals.map(deal => (
          <div key={deal.id} className="deal-card">
            <div className="deal-header">
              <h3>{deal.company}</h3>
              <span className="deal-amount">{deal.amount}</span>
            </div>
            <div className="deal-details">
              <span className="deal-stage">{deal.stage}</span>
              <span className="deal-sector">{deal.sector}</span>
              <span className="deal-date">{deal.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
