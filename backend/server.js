import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { body, query, validationResult } from 'express-validator'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { fetchBiotechCompanies, fetchQuote, fetchNews } from './yahoo.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const AI_ENABLED = process.env.AI_ENABLED !== 'false'

// Security: Helmet adds various HTTP headers for security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || "http://localhost:5173"],
    }
  }
}))

// Security: Restrict CORS to frontend domain only
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173' // Always allow local development
]

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true)
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.'
      return callback(new Error(msg), false)
    }
    return callback(null, true)
  },
  methods: ['GET', 'POST'],
  credentials: true
}))

app.use(express.json({ limit: '1mb' })) // Limit JSON body size

// Security: Rate limiting for general API endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { 
    success: false,
    error: 'Too many requests from this IP, please try again in 15 minutes.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Security: Stricter rate limiting for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per hour per IP
  message: { 
    success: false,
    error: 'AI quota exceeded. Please try again in an hour.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Apply general rate limiting to all routes
app.use(generalLimiter)

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' })
})

// GET /biotech - Returns real biotech company data from Yahoo Finance API
app.get('/biotech', async (req, res) => {
  try {
    console.log('Fetching biotech companies from Yahoo Finance...')
    
    // Fetch real data from Yahoo Finance (no API key needed!)
    const result = await fetchBiotechCompanies()
    
    res.json({
      success: true,
      total: result.total,
      companies: result.companies,
      sectors: result.sectors,
      industries: result.industries,
      source: 'yahoo_finance'
    })

  } catch (error) {
    console.error('Error fetching biotech companies:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch biotech companies',
      details: error.message
    })
  }
})

// GET /quote?symbol=XYZ - Returns detailed quote data for a stock
app.get('/quote', [
  query('symbol')
    .isString()
    .trim()
    .isLength({ min: 1, max: 10 })
    .matches(/^[A-Za-z0-9\-\.]+$/)
    .withMessage('Symbol must be 1-10 alphanumeric characters')
], async (req, res) => {
  // Validate input
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Invalid input',
      details: errors.array()
    })
  }

  try {
    const { symbol } = req.query
    
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
app.get('/news', [
  query('symbol')
    .isString()
    .trim()
    .isLength({ min: 1, max: 10 })
    .matches(/^[A-Za-z0-9\-\.]+$/)
    .withMessage('Symbol must be 1-10 alphanumeric characters')
], async (req, res) => {
  // Validate input
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Invalid input',
      details: errors.array()
    })
  }

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

// GET /news/recent - Aggregated recent news from all tracked companies
app.get('/news/recent', async (req, res) => {
  try {
    console.log('Fetching recent news for all tracked companies...')
    
    // Fetch companies first
    const companiesResult = await fetchBiotechCompanies()
    const companies = companiesResult.companies
    
    // Keywords relevant to 2NA FISH field (cancer diagnostics, RNA, spatial transcriptomics)
    const relevantKeywords = [
      'cancer', 'diagnostic', 'rna', 'spatial', 'transcriptomic', 
      'genomic', 'oncology', 'tumor', 'biomarker', 'precision medicine',
      'molecular', 'sequencing', 'imaging', 'pathology', 'fish'
    ]
    
    // Fetch news for top companies (limit to prevent overload)
    const newsPromises = companies.slice(0, 10).map(async (company) => {
      try {
        const news = await fetchNews(company.symbol)
        return news.map(article => ({
          ...article,
          companySymbol: company.symbol,
          companyName: company.name
        }))
      } catch (err) {
        console.error(`Error fetching news for ${company.symbol}:`, err.message)
        return []
      }
    })
    
    const allNewsArrays = await Promise.all(newsPromises)
    let allNews = allNewsArrays.flat()
    
    // Score news by relevance to 2NA FISH field
    allNews = allNews.map(article => {
      const text = `${article.title} ${article.summary || ''}`.toLowerCase()
      const relevanceScore = relevantKeywords.reduce((score, keyword) => {
        return score + (text.includes(keyword.toLowerCase()) ? 1 : 0)
      }, 0)
      
      return {
        ...article,
        relevanceScore,
        isRelevantTo2NAFISH: relevanceScore > 0
      }
    })
    
    // Sort by relevance score first, then by date
    allNews.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore
      }
      return new Date(b.publishedAt) - new Date(a.publishedAt)
    })
    
    // Return top 3 most relevant/recent
    const recentNews = allNews.slice(0, 3).map(article => ({
      title: article.title,
      summary: article.summary || 'No summary available',
      link: article.link,
      publishedAt: article.publishedAt,
      source: article.publisher,
      companySymbol: article.companySymbol,
      companyName: article.companyName,
      relevanceScore: article.relevanceScore,
      isRelevantTo2NAFISH: article.isRelevantTo2NAFISH
    }))
    
    res.json({
      success: true,
      count: recentNews.length,
      data: recentNews,
      source: 'yahoo_finance'
    })
    
  } catch (error) {
    console.error('Error fetching recent news:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent news',
      details: error.message
    })
  }
})

// GET /news/past - Past news (older items)
app.get('/news/past', async (req, res) => {
  try {
    console.log('Fetching past news for tracked companies...')
    
    const companiesResult = await fetchBiotechCompanies()
    const companies = companiesResult.companies
    
    // Fetch news for top companies
    const newsPromises = companies.slice(0, 10).map(async (company) => {
      try {
        const news = await fetchNews(company.symbol)
        return news.map(article => ({
          ...article,
          companySymbol: company.symbol,
          companyName: company.name
        }))
      } catch (err) {
        console.error(`Error fetching news for ${company.symbol}:`, err.message)
        return []
      }
    })
    
    const allNewsArrays = await Promise.all(newsPromises)
    let allNews = allNewsArrays.flat()
    
    // Sort by date (most recent first)
    allNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    
    // Return items 4-6 (past news, not in recent)
    const pastNews = allNews.slice(3, 6).map(article => ({
      title: article.title,
      summary: article.summary || 'No summary available',
      link: article.link,
      publishedAt: article.publishedAt,
      source: article.publisher,
      companySymbol: article.companySymbol,
      companyName: article.companyName
    }))
    
    res.json({
      success: true,
      count: pastNews.length,
      data: pastNews,
      source: 'yahoo_finance'
    })
    
  } catch (error) {
    console.error('Error fetching past news:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch past news',
      details: error.message
    })
  }
})

// POST /ask - Forwards message to Gemini API and returns response
app.post('/ask', aiLimiter, [
  body('message')
    .isString()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters')
], async (req, res) => {
  // Check if AI is enabled
  if (!AI_ENABLED) {
    return res.status(503).json({
      success: false,
      error: 'AI features are currently disabled'
    })
  }

  // Validate input
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Invalid input',
      details: errors.array()
    })
  }

  try {
    const { message } = req.body

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
app.post('/api/chat', aiLimiter, [
  body('message')
    .isString()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters')
], async (req, res) => {
  // Check if AI is enabled
  if (!AI_ENABLED) {
    return res.status(503).json({
      success: false,
      error: 'AI features are currently disabled'
    })
  }

  // Validate input
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Invalid input',
      details: errors.array()
    })
  }

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
