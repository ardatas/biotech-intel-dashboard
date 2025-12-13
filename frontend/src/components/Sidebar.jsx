import React from 'react'
import './Sidebar.css'

function Sidebar({ filters, setFilters }) {
  return (
    <aside className="sidebar">
      <h2>Filters</h2>
      
      <div className="filter-group">
        <label>Search</label>
        <input
          type="text"
          placeholder="Search companies..."
          value={filters.searchTerm}
          onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
        />
      </div>

      <div className="filter-group">
        <label>Investment Stage</label>
        <select
          value={filters.stage}
          onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
        >
          <option value="all">All Stages</option>
          <option value="Seed">Seed</option>
          <option value="Series A">Series A</option>
          <option value="Series B">Series B</option>
          <option value="Series C">Series C</option>
          <option value="Acquired">Acquired</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Sector</label>
        <select
          value={filters.sector}
          onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
        >
          <option value="all">All Sectors</option>
          <option value="Oncology">Oncology</option>
          <option value="Neuroscience">Neuroscience</option>
          <option value="Gene Therapy">Gene Therapy</option>
          <option value="Immunology">Immunology</option>
          <option value="Cell Therapy">Cell Therapy</option>
          <option value="Bioinformatics">Bioinformatics</option>
          <option value="Regenerative Medicine">Regenerative Medicine</option>
          <option value="Genomics">Genomics</option>
          <option value="Microbiome">Microbiome</option>
        </select>
      </div>

      <button
        className="reset-button"
        onClick={() => setFilters({ stage: 'all', sector: 'all', searchTerm: '' })}
      >
        Reset Filters
      </button>
    </aside>
  )
}

export default Sidebar
