/**
 * Market Intelligence Service
 * Combines Reddit social sentiment with Yahoo Finance data
 */

import { getTrendingTickers } from './reddit.js'
import { fetchQuote, fetchNews } from '../yahoo.js'

/**
 * Get trending stocks by combining Reddit mentions with market data
 * @returns {Promise<Array>} - Top trending stocks with prices and sentiment
 */
export async function getTrendingStocks() {
  try {
    // Get trending tickers from Reddit
    const redditTrending = await getTrendingTickers(['wallstreetbets', 'stocks'], 50)

    if (redditTrending.length === 0) {
      console.log('No Reddit data available, falling back to default tickers')
      // Fallback to popular stocks if Reddit unavailable
      return getDefaultTrendingStocks()
    }

    // Take top 15 most mentioned tickers
    const topTickers = redditTrending.slice(0, 15)

    // Enrich with Yahoo Finance data (price, volume, change)
    const enrichedStocks = await Promise.all(
      topTickers.map(async (item) => {
        try {
          const quote = await fetchQuote(item.ticker)
          
          return {
            symbol: item.ticker,
            name: quote.longName || quote.shortName || item.ticker,
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange,
            changePercent: quote.regularMarketChangePercent,
            volume: quote.regularMarketVolume,
            marketCap: quote.marketCap,
            mentions: item.mentions,
            socialScore: item.score,
            topPost: item.topPost,
            source: 'reddit_yahoo'
          }
        } catch (error) {
          console.error(`Failed to fetch quote for ${item.ticker}:`, error.message)
          // Return basic info even if Yahoo Finance fails
          return {
            symbol: item.ticker,
            name: item.ticker,
            price: null,
            change: null,
            changePercent: null,
            volume: null,
            marketCap: null,
            mentions: item.mentions,
            socialScore: item.score,
            topPost: item.topPost,
            source: 'reddit_only'
          }
        }
      })
    )

    // Filter out failed quotes and sort by social score
    return enrichedStocks
      .filter(stock => stock.price !== null)
      .sort((a, b) => b.socialScore - a.socialScore)

  } catch (error) {
    console.error('Error getting trending stocks:', error)
    return getDefaultTrendingStocks()
  }
}

/**
 * Fallback trending stocks when Reddit is unavailable
 * Returns top tech/popular stocks
 */
async function getDefaultTrendingStocks() {
  const defaultSymbols = ['TSLA', 'NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'AMD', 'NFLX', 'SPY']
  
  const stocks = await Promise.all(
    defaultSymbols.map(async (symbol) => {
      try {
        const quote = await fetchQuote(symbol)
        return {
          symbol,
          name: quote.longName || quote.shortName,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          volume: quote.regularMarketVolume,
          marketCap: quote.marketCap,
          mentions: 0,
          socialScore: 0,
          topPost: null,
          source: 'yahoo_default'
        }
      } catch (error) {
        return null
      }
    })
  )

  return stocks.filter(s => s !== null)
}

/**
 * Get general market news (not ticker-specific)
 * Aggregates news from major indices and market leaders
 * @returns {Promise<Array>} - Market news articles
 */
export async function getMarketNews() {
  try {
    // Fetch news from major market indices and tech leaders
    const symbols = ['SPY', 'QQQ', 'TSLA', 'NVDA', 'AAPL']
    
    const newsPromises = symbols.map(symbol => 
      fetchNews(symbol).catch(err => {
        console.error(`Failed to fetch news for ${symbol}:`, err.message)
        return []
      })
    )
    
    const newsArrays = await Promise.all(newsPromises)
    
    // Flatten and deduplicate by title
    const allNews = newsArrays.flat()
    const uniqueNews = new Map()
    
    allNews.forEach(article => {
      const key = article.title.toLowerCase().trim()
      if (!uniqueNews.has(key)) {
        uniqueNews.set(key, {
          title: article.title,
          summary: article.summary || 'No summary available',
          link: article.link,
          publishedAt: article.publishedAt,
          source: article.publisher,
          thumbnail: article.thumbnail
        })
      }
    })
    
    // Convert to array and sort by date
    const newsArray = Array.from(uniqueNews.values())
    newsArray.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    
    return newsArray.slice(0, 20) // Return top 20 most recent
    
  } catch (error) {
    console.error('Error fetching market news:', error)
    return []
  }
}

/**
 * Get enriched stock data combining price, news, and Reddit sentiment
 * @param {string} symbol - Stock ticker symbol
 * @returns {Promise<Object>} - Complete stock intelligence data
 */
export async function getStockIntelligence(symbol) {
  try {
    const [quote, news, discussions] = await Promise.all([
      fetchQuote(symbol),
      fetchNews(symbol),
      getStockDiscussions(symbol)
    ])

    return {
      symbol,
      name: quote.longName || quote.shortName,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
      dayHigh: quote.regularMarketDayHigh,
      dayLow: quote.regularMarketDayLow,
      yearHigh: quote.fiftyTwoWeekHigh,
      yearLow: quote.fiftyTwoWeekLow,
      news: news.slice(0, 10),
      discussions: discussions,
      socialSentiment: calculateSentiment(discussions)
    }

  } catch (error) {
    console.error(`Error getting intelligence for ${symbol}:`, error)
    throw error
  }
}

/**
 * Get Reddit discussions mentioning a specific stock
 * @param {string} symbol - Stock ticker
 * @returns {Promise<Array>} - Recent discussions about the stock
 */
async function getStockDiscussions(symbol) {
  try {
    const trending = await getTrendingTickers(['wallstreetbets', 'stocks', 'investing'], 100)
    const stockMention = trending.find(t => t.ticker === symbol.toUpperCase())
    
    if (!stockMention) {
      return []
    }

    return stockMention.topPost ? [stockMention.topPost] : []

  } catch (error) {
    console.error(`Error getting discussions for ${symbol}:`, error)
    return []
  }
}

/**
 * Calculate basic sentiment from discussion data
 * @param {Array} discussions - Discussion posts
 * @returns {Object} - Sentiment metrics
 */
function calculateSentiment(discussions) {
  if (!discussions || discussions.length === 0) {
    return { signal: 'neutral', mentions: 0, engagement: 0 }
  }

  const totalUpvotes = discussions.reduce((sum, d) => sum + (d.upvotes || 0), 0)
  const totalComments = discussions.reduce((sum, d) => sum + (d.comments || 0), 0)
  const engagement = totalUpvotes + totalComments

  return {
    signal: engagement > 1000 ? 'high' : engagement > 100 ? 'medium' : 'low',
    mentions: discussions.length,
    engagement
  }
}
