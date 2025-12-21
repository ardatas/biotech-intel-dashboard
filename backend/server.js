import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { fetchQuote, fetchNews } from './yahoo.js'
import { getTrendingStocks, getMarketNews, getStockIntelligence } from './services/market.js'
import { fetchSubredditPosts } from './services/reddit.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Rate limiting configuration
const marketLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 30, // 30 requests per minute
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10, // 10 AI requests per minute
  message: {
    success: false,
    error: 'AI rate limit exceeded. Please wait a moment.'
  }
})

// Middleware - CORS configuration for Vercel
app.use(cors({
  origin: true,
  credentials: true
}))
app.use(express.json())

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' })
})

// GET /quote?symbol=XYZ - Returns detailed quote data for a stock
app.get('/quote', async (req, res) => {
  try {
    const { symbol } = req.query
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Symbol parameter is required'
      })
    }
    
    console.log(`Fetching quote for ${symbol}...`)
    const quote = await fetchQuote(symbol)
    
    res.json({
      success: true,
      data: quote,
      source: 'yahoo_finance'
    })
    
  } catch (error) {
    console.error('Error fetching quote:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quote',
      details: error.message
    })
  }
})

// GET /news?symbol=XYZ - Returns AI-summarized news for a stock
app.get('/news', async (req, res) => {
  try {
    const { symbol } = req.query
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Symbol parameter is required'
      })
    }
    
    console.log(`Fetching news for ${symbol}...`)
    const news = await fetchNews(symbol)
    
    // Return news with original summaries (AI quota exceeded)
    const newsData = news.map(article => ({
      title: article.title,
      aiSummary: article.summary || 'No summary available',
      link: article.link,
      publishedAt: article.publishedAt,
      source: article.publisher,
      thumbnail: article.thumbnail
    }))
    
    res.json({
      success: true,
      count: newsData.length,
      data: newsData,
      source: 'yahoo_finance',
      note: 'AI summaries temporarily disabled due to API quota'
    })
    
  } catch (error) {
    console.error('Error fetching news:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news',
      details: error.message
    })
  }
})

// ========================================
// MARKET INTELLIGENCE ENDPOINTS
// ========================================

// GET /market/trending - Returns trending stocks from Reddit + market data
app.get('/market/trending', marketLimiter, async (req, res) => {
  try {
    console.log('Fetching trending stocks...')
    const trending = await getTrendingStocks()
    
    res.json({
      success: true,
      data: trending,
      source: 'reddit_yahoo_finance'
    })
  } catch (error) {
    console.error('Error fetching trending stocks:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending stocks',
      details: error.message
    })
  }
})

// GET /market/discussions?subreddit=wallstreetbets&limit=20
app.get('/market/discussions', marketLimiter, async (req, res) => {
  try {
    const { subreddit = 'wallstreetbets', limit = 20 } = req.query
    
    console.log(`Fetching discussions from r/${subreddit}...`)
    const posts = await fetchSubredditPosts(subreddit, parseInt(limit))
    
    res.json({
      success: true,
      subreddit,
      count: posts.length,
      data: posts,
      source: 'reddit'
    })
  } catch (error) {
    console.error('Error fetching discussions:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch discussions',
      details: error.message
    })
  }
})

// GET /market/news - General market news (replaces /news/recent and /news/past)
app.get('/market/news', marketLimiter, async (req, res) => {
  try {
    console.log('Fetching general market news...')
    const news = await getMarketNews()
    
    res.json({
      success: true,
      count: news.length,
      data: news,
      source: 'yahoo_finance'
    })
  } catch (error) {
    console.error('Error fetching market news:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market news',
      details: error.message
    })
  }
})

// GET /stock/:symbol - Complete stock intelligence (price + news + Reddit sentiment)
app.get('/stock/:symbol', marketLimiter, async (req, res) => {
  try {
    const { symbol } = req.params
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Stock symbol is required'
      })
    }
    
    console.log(`Fetching intelligence for ${symbol}...`)
    const intelligence = await getStockIntelligence(symbol.toUpperCase())
    
    res.json({
      success: true,
      data: intelligence,
      source: 'yahoo_reddit'
    })
  } catch (error) {
    console.error(`Error fetching stock intelligence for ${req.params.symbol}:`, error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock intelligence',
      details: error.message
    })
  }
})

// POST /ask - Forwards message to Gemini API and returns response
app.post('/ask', aiLimiter, async (req, res) => {
  try {
    const { message } = req.body

    if (!message) {
      return res.status(400).json({ 
        success: false,
        error: 'Message is required' 
      })
    }

    // Call Gemini API
    const result = await model.generateContent(message)
    const response = await result.response
    const text = response.text()

    res.json({ 
      success: true,
      response: text 
    })
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to process request',
      details: error.message 
    })
  }
})

// Legacy chat endpoint for compatibility
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Call Gemini API
    const result = await model.generateContent(message)
    const response = await result.response
    const text = response.text()

    res.json({ 
      response: text 
    })
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message 
    })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

// Export for Vercel serverless
export default app
