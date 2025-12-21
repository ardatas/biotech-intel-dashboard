import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { fetchBiotechCompanies, fetchQuote, fetchNews } from './yahoo.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

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

// POST /ask - Forwards message to Gemini API and returns response
app.post('/ask', async (req, res) => {
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
