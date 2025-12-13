/**
 * Yahoo Finance API Integration - Enhanced Version
 * Fetches real-time biotech and life sciences company data
 * Includes biotech-adjacent sectors
 * No API key required!
 */

import { ALL_KEYWORDS, categorizeSectors, findMatchingKeywords } from './config/sectors.js'

/**
 * Fetches biotech and life sciences companies from Yahoo Finance
 * @returns {Promise<Object>} - Object containing companies, sectors, industries, and sector mappings
 */
export async function fetchBiotechCompanies() {
  try {
    const allCompanies = []
    
    // Expanded search terms to cover biotech-adjacent sectors
    const searchTerms = [
      'biotech',
      'pharmaceutical', 
      'biopharma',
      'therapeutics',
      'genomics',
      'diagnostics',
      'medical device',
      'life sciences'
    ]
    
    for (const term of searchTerms) {
      const companies = await searchYahooFinance(term)
      allCompanies.push(...companies)
    }
    
    // Remove duplicates based on symbol
    const uniqueCompanies = removeDuplicates(allCompanies)
    
    // Enrich companies with sector categorization
    const enrichedCompanies = uniqueCompanies.map(company => {
      const categorization = categorizeSectors(company)
      return {
        ...company,
        primarySector: categorization.primarySector,
        secondarySectors: categorization.secondarySectors,
        matchReasons: categorization.matchReasons
      }
    })
    
    // Sort by score (relevance)
    const sortedCompanies = enrichedCompanies.sort((a, b) => (b.score || 0) - (a.score || 0))
    
    // Extract unique sectors and industries
    const sectors = extractUniqueSectors(sortedCompanies)
    const industries = extractUniqueIndustries(sortedCompanies)
    
    // Create sector-to-company mappings
    const sectorMappings = createSectorMappings(sortedCompanies)
    
    return {
      companies: sortedCompanies,
      sectors,
      industries,
      sectorMappings,
      total: sortedCompanies.length
    }
  } catch (error) {
    console.error('Error fetching biotech companies from Yahoo Finance:', error)
    throw error
  }
}

/**
 * Search Yahoo Finance for companies matching a keyword
 * @param {string} keyword - Search term
 * @returns {Promise<Array>} - List of matching companies
 */
async function searchYahooFinance(keyword) {
  try {
    // Yahoo Finance public search endpoint
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(keyword)}&quotesCount=15&newsCount=0`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Extract and clean the quotes data
    const quotes = data.quotes || []
    
    return quotes
      .filter(isRelevantCompany)
      .map(cleanCompanyData)
    
  } catch (error) {
    console.error(`Error searching Yahoo Finance for "${keyword}":`, error)
    return []
  }
}

/**
 * Filter out non-relevant results
 * Uses extended keyword matching for biotech-adjacent sectors
 * @param {Object} quote - Yahoo Finance quote object
 * @returns {boolean} - True if relevant to biotech or life sciences
 */
function isRelevantCompany(quote) {
  // Only include equity stocks (not funds, ETFs, etc.)
  const validTypes = ['EQUITY', 'equity']
  
  if (!validTypes.includes(quote.quoteType)) {
    return false
  }
  
  // Must have a symbol
  if (!quote.symbol) {
    return false
  }
  
  // Check if it matches any biotech-adjacent keywords
  const searchText = [
    quote.longname,
    quote.shortname,
    quote.industryDisp,
    quote.sectorDisp
  ].join(' ')
  
  const matches = findMatchingKeywords(searchText, ALL_KEYWORDS)
  return matches.length > 0
}

/**
 * Clean and standardize company data from Yahoo Finance
 * Stores raw data for sector categorization
 * @param {Object} quote - Raw Yahoo Finance quote
 * @returns {Object} - Cleaned company data with raw fields preserved
 */
function cleanCompanyData(quote) {
  return {
    name: quote.longname || quote.shortname || 'Unknown Company',
    symbol: quote.symbol,
    exchange: quote.exchDisp || quote.exchange || 'N/A',
    quoteType: quote.quoteType || 'EQUITY',
    industry: quote.industryDisp || quote.industry || 'Biotechnology',
    sector: quote.sectorDisp || quote.sector || 'Healthcare',
    score: quote.score || 0,
    isYahooFinance: quote.isYahooFinance || false,
    // Preserve raw fields for sector matching
    longname: quote.longname || '',
    shortname: quote.shortname || '',
    industryDisp: quote.industryDisp || '',
    sectorDisp: quote.sectorDisp || ''
  }
}

/**
 * Remove duplicate companies based on symbol
 * @param {Array} companies - List of companies
 * @returns {Array} - Unique companies
 */
function removeDuplicates(companies) {
  const seen = new Set()
  return companies.filter(company => {
    if (seen.has(company.symbol)) {
      return false
    }
    seen.add(company.symbol)
    return true
  })
}

/**
 * Extract unique sectors with company counts
 * Uses primarySector for aggregation
 * @param {Array} companies - Array of company objects
 * @returns {Array} - Array of {name, count} objects sorted by count
 */
function extractUniqueSectors(companies) {
  const sectorMap = new Map()
  
  companies.forEach(company => {
    const sector = company.primarySector || company.sector || 'Other'
    sectorMap.set(sector, (sectorMap.get(sector) || 0) + 1)
  })
  
  return Array.from(sectorMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Extract unique industries with company counts
 * @param {Array} companies - Array of company objects
 * @returns {Array} - Array of {name, count} objects sorted by count
 */
function extractUniqueIndustries(companies) {
  const industryMap = new Map()
  
  companies.forEach(company => {
    const industry = company.industry || 'Other'
    industryMap.set(industry, (industryMap.get(industry) || 0) + 1)
  })
  
  return Array.from(industryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Create sector-to-company mappings
 * Maps each sector to list of company symbols
 * @param {Array} companies - Array of enriched company objects
 * @returns {Object} - Object mapping sector names to company symbols
 */
function createSectorMappings(companies) {
  const mappings = {}
  
  companies.forEach(company => {
    const primarySector = company.primarySector || 'Other'
    
    // Add to primary sector mapping
    if (!mappings[primarySector]) {
      mappings[primarySector] = []
    }
    mappings[primarySector].push(company.symbol)
    
    // Add to secondary sector mappings
    if (company.secondarySectors && Array.isArray(company.secondarySectors)) {
      company.secondarySectors.forEach(sector => {
        if (!mappings[sector]) {
          mappings[sector] = []
        }
        if (!mappings[sector].includes(company.symbol)) {
          mappings[sector].push(company.symbol)
        }
      })
    }
  })
  
  return mappings
}

/**
 * Fetch detailed quote data for a stock symbol
 * Note: Yahoo Finance public API has limited quote data
 * @param {string} symbol - Stock ticker symbol
 * @returns {Promise<Object>} - Quote data (limited)
 */
export async function fetchQuote(symbol) {
  try {
    // Return basic quote info - full quote data requires authenticated API access
    // For a free solution, we'll return what we have from the company data
    return {
      symbol: symbol,
      shortName: symbol,
      longName: symbol,
      marketCap: null,
      regularMarketPrice: null,
      regularMarketChange: null,
      regularMarketChangePercent: null,
      currency: 'USD',
      volume: null,
      trailingPE: null,
      fiftyTwoWeekHigh: null,
      fiftyTwoWeekLow: null,
      averageVolume: null,
      exchange: 'N/A',
      note: 'Live quote data requires paid API access. This is a free tier limitation.'
    }
    
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error)
    throw error
  }
}

/**
 * Fetch news for a stock symbol
 * @param {string} symbol - Stock ticker symbol
 * @returns {Promise<Array>} - News articles
 */
export async function fetchNews(symbol) {
  try {
    // Yahoo Finance doesn't have a direct public news API, so we'll use the search endpoint
    // which sometimes includes news items
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(symbol)}&quotesCount=1&newsCount=10`
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    
    if (!response.ok) {
      throw new Error(`Yahoo Finance news API error: ${response.status}`)
    }
    
    const data = await response.json()
    const news = data.news || []
    
    return news.slice(0, 8).map(article => ({
      title: article.title || 'No title',
      link: article.link || '',
      publisher: article.publisher || 'Unknown',
      publishedAt: article.providerPublishTime ? new Date(article.providerPublishTime * 1000).toISOString() : null,
      thumbnail: article.thumbnail?.resolutions?.[0]?.url || null,
      summary: article.summary || ''
    }))
    
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error)
    return []
  }
}
