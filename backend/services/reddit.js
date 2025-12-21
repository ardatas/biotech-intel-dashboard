/**
 * Reddit API Integration Service
 * Fetches posts from subreddits using Reddit's public JSON API
 * No authentication required for read-only access
 */

import NodeCache from 'node-cache'

// Cache Reddit data for 10 minutes (600 seconds)
const cache = new NodeCache({ stdTTL: 600 })

// Common words to exclude from ticker detection (prevents false positives)
const EXCLUDED_WORDS = new Set([
  'A', 'I', 'AM', 'AN', 'AND', 'ARE', 'AS', 'AT', 'BE', 'BY', 'CAN', 'DO', 'FOR',
  'FROM', 'HE', 'IF', 'IN', 'IS', 'IT', 'ME', 'MY', 'NO', 'NOT', 'OF', 'ON', 'OR',
  'OUT', 'SO', 'THE', 'TO', 'UP', 'US', 'WE', 'YOU', 'ALL', 'CEO', 'CFO', 'CTO',
  'DD', 'EDIT', 'ELI', 'FAQ', 'FYI', 'IMO', 'IPO', 'NEW', 'NOW', 'OLD', 'SEC',
  'TL', 'USD', 'WSB', 'YTD', 'YOLO', 'DD', 'TA', 'ATH', 'EOD', 'AH', 'PM', 'IMO',
  'TLDR', 'ETA', 'NSFW', 'OC', 'OP', 'PSA', 'TIL', 'FOMO', 'FUD', 'HODL', 'APE'
])

/**
 * Extract stock tickers from text
 * Supports both cashtag format ($TSLA) and bare tickers (NVDA)
 * @param {string} text - Text to extract tickers from
 * @returns {string[]} - Array of unique ticker symbols
 */
export function extractTickers(text) {
  if (!text) return []

  const tickers = new Set()

  // Pattern 1: Cashtags ($TSLA, $NVDA)
  const cashtagPattern = /\$([A-Z]{1,5})\b/g
  let match
  while ((match = cashtagPattern.exec(text)) !== null) {
    tickers.add(match[1])
  }

  // Pattern 2: Bare tickers (TSLA, NVDA) - more conservative
  const bareTickerPattern = /\b([A-Z]{2,5})\b/g
  while ((match = bareTickerPattern.exec(text)) !== null) {
    const ticker = match[1]
    // Filter out common words and excluded terms
    if (!EXCLUDED_WORDS.has(ticker) && ticker.length >= 2 && ticker.length <= 5) {
      tickers.add(ticker)
    }
  }

  return Array.from(tickers)
}

/**
 * Fetch recent posts from a subreddit using Reddit's public JSON API
 * @param {string} subreddit - Subreddit name (without r/)
 * @param {number} limit - Number of posts to fetch (max 100)
 * @returns {Promise<Array>} - Array of post objects with extracted tickers
 */
export async function fetchSubredditPosts(subreddit = 'wallstreetbets', limit = 50) {
  const cacheKey = `reddit:${subreddit}:${limit}`
  
  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached) {
    console.log(`Cache hit for r/${subreddit}`)
    return cached
  }

  try {
    console.log(`Fetching ${limit} posts from r/${subreddit}...`)

    // Use Reddit's public JSON API (no auth required)
    const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${Math.min(limit, 100)}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MarketIntelligence/1.0.0 (Stock market analysis tool)'
      }
    })

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const posts = data.data?.children || []

    const processedPosts = posts
      .map(item => {
        const post = item.data
        const title = post.title || ''
        const selftext = post.selftext || ''
        const combinedText = `${title} ${selftext}`

        // Extract tickers from title and body
        const tickers = extractTickers(combinedText)

        return {
          id: post.id,
          title: post.title,
          url: `https://reddit.com${post.permalink}`,
          author: post.author,
          subreddit: post.subreddit,
          upvotes: post.ups,
          comments: post.num_comments,
          timestamp: post.created_utc * 1000, // Convert to milliseconds
          tickers: tickers,
          flair: post.link_flair_text || null
        }
      })
      .filter(post => post.tickers.length > 0) // Only keep posts with tickers

    // Cache results
    cache.set(cacheKey, processedPosts)

    console.log(`Found ${processedPosts.length} posts with tickers from r/${subreddit}`)
    return processedPosts

  } catch (error) {
    console.error(`Error fetching from r/${subreddit}:`, error.message)
    
    // Check if it's a rate limit error
    if (error.message.includes('429')) {
      console.warn('Reddit API rate limit hit. Using cached data or returning empty.')
    }
    
    return []
  }
}

/**
 * Aggregate ticker mentions across posts
 * Weights mentions by post upvotes (viral posts = higher signal)
 * @param {Array} posts - Array of post objects from fetchSubredditPosts
 * @returns {Array} - Sorted array of {ticker, count, weightedScore, topPost}
 */
export function aggregateMentions(posts) {
  const mentionMap = new Map()

  posts.forEach(post => {
    post.tickers.forEach(ticker => {
      if (!mentionMap.has(ticker)) {
        mentionMap.set(ticker, {
          ticker,
          count: 0,
          weightedScore: 0,
          posts: []
        })
      }

      const data = mentionMap.get(ticker)
      data.count += 1
      
      // Weight by upvotes (log scale to prevent outliers from dominating)
      const upvoteWeight = Math.log10(Math.max(post.upvotes, 1) + 1)
      data.weightedScore += upvoteWeight
      
      data.posts.push({
        title: post.title,
        url: post.url,
        upvotes: post.upvotes,
        comments: post.comments
      })
    })
  })

  // Convert to array and sort by weighted score
  const aggregated = Array.from(mentionMap.values())
    .map(data => ({
      ticker: data.ticker,
      mentions: data.count,
      score: Math.round(data.weightedScore * 100) / 100,
      topPost: data.posts.sort((a, b) => b.upvotes - a.upvotes)[0]
    }))
    .sort((a, b) => b.score - a.score)

  return aggregated
}

/**
 * Get trending tickers from multiple subreddits
 * @param {string[]} subreddits - Array of subreddit names
 * @param {number} limit - Posts per subreddit
 * @returns {Promise<Array>} - Aggregated trending tickers
 */
export async function getTrendingTickers(subreddits = ['wallstreetbets', 'stocks'], limit = 50) {
  const cacheKey = `trending:${subreddits.join(',')}`
  
  const cached = cache.get(cacheKey)
  if (cached) {
    return cached
  }

  try {
    // Fetch posts from all subreddits in parallel
    const postsArrays = await Promise.all(
      subreddits.map(sub => fetchSubredditPosts(sub, limit))
    )

    // Flatten and aggregate
    const allPosts = postsArrays.flat()
    const trending = aggregateMentions(allPosts)

    cache.set(cacheKey, trending)
    return trending

  } catch (error) {
    console.error('Error getting trending tickers:', error)
    return []
  }
}
