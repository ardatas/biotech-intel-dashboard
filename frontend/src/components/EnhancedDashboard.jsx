import React, { useState, useEffect } from 'react'
import './EnhancedDashboard.css'
import CompanyDetail from './CompanyDetail'
import Footer from './Footer'
import RecentNews from './RecentNews'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * Enhanced Dashboard Component
 * Displays real-time biotech companies with filtering and detail view
 */
function EnhancedDashboard() {
  const [companies, setCompanies] = useState([])
  const [sectors, setSectors] = useState([])
  const [industries, setIndustries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSector, setSelectedSector] = useState('all')
  const [selectedIndustry, setSelectedIndustry] = useState('all')
  
  // Selected company for detail view
  const [selectedCompany, setSelectedCompany] = useState(null)

  useEffect(() => {
    fetchBiotechCompanies()
  }, [])

  const fetchBiotechCompanies = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_URL}/biotech`)
      const data = await response.json()
      
      if (data.success) {
        setCompanies(data.companies)
        setSectors(data.sectors)
        setIndustries(data.industries)
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

  // Filter companies - check both primary and secondary sectors
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Match against primary sector OR any secondary sector
    const matchesSector = selectedSector === 'all' || 
                         company.primarySector === selectedSector ||
                         company.sector === selectedSector ||
                         (company.secondarySectors && company.secondarySectors.includes(selectedSector))
    
    const matchesIndustry = selectedIndustry === 'all' || company.industry === selectedIndustry
    
    return matchesSearch && matchesSector && matchesIndustry
  })

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
          <button onClick={fetchBiotechCompanies}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="enhanced-dashboard">
        <div className="dashboard-header">
          <h1>🧬 Biotech Intelligence Dashboard</h1>
          <p className="dashboard-subtitle">
            {companies.length} companies tracked
          </p>
        </div>

        {/* Filters */}
        <div className="dashboard-filters">
          <div className="filter-search">
            <input
              type="text"
              placeholder="Search companies or symbols..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-selects">
            <select value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)}>
              <option value="all">All Sectors</option>
              {sectors.map((sector, idx) => (
                <option key={idx} value={sector.name}>
                  {sector.name} ({sector.count})
                </option>
              ))}
            </select>
            
            <select value={selectedIndustry} onChange={(e) => setSelectedIndustry(e.target.value)}>
              <option value="all">All Industries</option>
              {industries.map((industry, idx) => (
                <option key={idx} value={industry.name}>
                  {industry.name} ({industry.count})
                </option>
              ))}
            </select>
            
            <button 
              className="filter-reset"
              onClick={() => {
                setSearchTerm('')
                setSelectedSector('all')
                setSelectedIndustry('all')
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Related Sectors Section */}
        <div className="related-sectors">
          <h3>Related Biotech Sectors</h3>
          <div className="sector-tags">
            {sectors.slice(0, 6).map((sector, idx) => (
              <button
                key={idx}
                className={`sector-tag ${selectedSector === sector.name ? 'active' : ''}`}
                onClick={() => setSelectedSector(sector.name)}
              >
                {sector.name} <span className="sector-count">{sector.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent News Section */}
        <RecentNews />

        {/* Results count */}
        <div className="results-info">
          Showing {filteredCompanies.length} of {companies.length} companies
        </div>

        {/* Company List */}
        <div className="companies-grid">
          {filteredCompanies.map((company, index) => (
            <div 
              key={`${company.symbol}-${index}`} 
              className="company-card"
              onClick={() => setSelectedCompany(company)}
            >
              <div className="company-header">
                <div>
                  <h3>{company.name}</h3>
                  <p className="company-symbol-text">{company.symbol}</p>
                </div>
                <span className="company-symbol">{company.symbol}</span>
              </div>
              
              <div className="company-meta">
                <span className="company-exchange">{company.exchange}</span>
              </div>
              
              <div className="company-tags">
                <span className="tag-sector primary">
                  {company.primarySector || company.sector}
                </span>
                {company.secondarySectors && company.secondarySectors.length > 0 && (
                  company.secondarySectors.map((sector, idx) => (
                    <span key={idx} className="tag-sector secondary">
                      {sector}
                    </span>
                  ))
                )}
                <span className="tag-industry">{company.industry}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Company Detail Panel */}
        {selectedCompany && (
          <CompanyDetail 
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
