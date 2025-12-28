/**
 * Yahoo Finance API Integration
 * Fetches stock quotes and news data
 * No API key required!
 */

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
