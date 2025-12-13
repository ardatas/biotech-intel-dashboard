# 🧬 Biotech Intelligence Dashboard

A production-ready biotech investment intelligence dashboard with real-time market data, AI-powered news analysis, and comprehensive security.

---

## ✨ Features

- 📊 **Real-Time Biotech Data** - Live stock quotes from Yahoo Finance
- 🔍 **Smart Search & Filters** - Search by company, filter by sector/industry
- 📰 **Recent News Feed** - Aggregated news with relevance scoring for 2NA FISH field
- 🤖 **AI Chatbot** - Powered by Google Gemini for biotech Q&A
- 🔒 **Enterprise Security** - Rate limiting, input validation, CORS protection
- 🌐 **Production Ready** - Deploy to Vercel/Render in 15 minutes

---

## 🚀 Quick Start - Deploy in 15 Minutes!

**New to deployment? Start here:** [QUICK_START.md](QUICK_START.md)

This guide walks you through deploying your dashboard to the cloud (free!) with zero prior experience needed.

---

## 📚 Documentation

### Deployment Guides

1. **[QUICK_START.md](QUICK_START.md)** ⭐ **START HERE!** - Beginner-friendly 15-minute deployment
2. **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** - Detailed Vercel deployment guide
3. **[RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)** - Alternative Render deployment guide
4. **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Platform-agnostic deployment guide

### Technical Documentation

5. **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Complete code structure and reference
6. **[SECURITY_IMPLEMENTATION_SUMMARY.md](SECURITY_IMPLEMENTATION_SUMMARY.md)** - Security features explained
7. **[IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md)** - Pre-deployment checklist
8. **[DEPLOYMENT_PACKAGE.md](DEPLOYMENT_PACKAGE.md)** - Complete deployment package overview

---

## 🏗️ Project Structure

```
biotech-intel-dashboard/
│
├── backend/                          # Node.js Express API
│   ├── server.js                     # Main API server (rate limiting, security)
│   ├── yahoo.js                      # Yahoo Finance API client
│   ├── package.json                  # Dependencies
│   ├── .env                          # Environment variables (NEVER commit!)
│   ├── .env.example                  # Template for environment setup
│   ├── vercel.json                   # Vercel deployment config
│   └── render.yaml                   # Render deployment config
│
├── frontend/                         # React + Vite UI
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── EnhancedDashboard.jsx # Main dashboard
│   │   │   ├── CompanyDetail.jsx     # Company detail modal
│   │   │   ├── RecentNews.jsx        # Recent news feed
│   │   │   ├── Chatbot.jsx           # AI chatbot widget
│   │   │   └── [+ more components]
│   │   ├── App.jsx                   # Main app component
│   │   └── main.jsx                  # React entry point
│   ├── .env.development              # Local dev configuration
│   ├── .env.production               # Production configuration
│   ├── .env.example                  # Template
│   └── vercel.json                   # Vercel deployment config
│
└── Documentation/                    # Deployment & security guides
    ├── QUICK_START.md                # 15-min deployment guide
    ├── VERCEL_DEPLOYMENT.md          # Vercel guide
    ├── RENDER_DEPLOYMENT.md          # Render guide
    └── [+ more documentation]
```

---

## 🔒 Security Features

Your dashboard includes enterprise-grade security:

- ✅ **Rate Limiting** - 100 requests/15min (general), 20 requests/hour (AI)
- ✅ **CORS Protection** - Restricts access to your frontend only
- ✅ **Input Validation** - Prevents SQL injection, XSS attacks
- ✅ **Security Headers** - Helmet.js (CSP, X-Frame-Options, HSTS)
- ✅ **Environment Variables** - API keys secured, never exposed in code
- ✅ **HTTPS Encryption** - Automatic on Vercel/Render

---

## 💻 Local Development

### Prerequisites

- Node.js 18+ installed
- Google Gemini API key (free from https://ai.google.dev/)

### Step 1: Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/biotech-intel-dashboard.git
cd biotech-intel-dashboard
```

### Step 2: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 3: Set Up Environment Variables

**Backend Setup:**

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add your Google Gemini API key:

```env
PORT=3000
GEMINI_API_KEY=your_new_api_key_here
FRONTEND_URL=http://localhost:5173
AI_ENABLED=true
```

**Get API key:** https://ai.google.dev/ (free)

**Frontend Setup:**

Frontend `.env.development` is already configured for local development:

```env
VITE_API_URL=http://localhost:3000
```

### Step 4: Run Development Servers

**Terminal 1 - Backend:**

```bash
cd backend
node server.js
```

Expected output:
```
🚀 Server running on http://localhost:3000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.0.0  ready in XX ms
➜  Local:   http://localhost:5173/
```

### Step 5: Open Dashboard

Open your browser to: **http://localhost:5173**

---

## 🧪 Testing Locally

### Test Backend API

```bash
# Test biotech companies endpoint
curl http://localhost:3000/biotech

# Test quote endpoint
curl "http://localhost:3000/quote?symbol=ILMN"

# Test news endpoint
curl "http://localhost:3000/news?symbol=ILMN"

# Test AI chatbot
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{"message":"What is biotechnology?"}'
```

### Test Frontend

1. Open http://localhost:5173
2. Check these features:
   - [ ] Companies load in table
   - [ ] Search works
   - [ ] Click company → Detail modal opens
   - [ ] News loads
   - [ ] Recent News section shows articles
   - [ ] AI chatbot opens and responds

---

## 📦 Building for Production

### Build Frontend

```bash
cd frontend
npm run build
```

Output: `frontend/dist/` directory with optimized static files

### Build Backend

No build step required - Node.js runs directly from `server.js`

---

## 🌐 Deployment

### Quick Deploy (15 minutes)

Follow the [QUICK_START.md](QUICK_START.md) guide for step-by-step deployment to Vercel (free tier).

### Platform Options

| Platform | Guide | Best For |
|----------|-------|----------|
| **Vercel** | [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) | Fastest deployment, beginners |
| **Render** | [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) | Traditional hosting, always-on |
| **Hybrid** | Both guides | Best performance (Render backend + Vercel frontend) |

---

## 🛠️ Tech Stack

### Backend

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **APIs:**
  - Yahoo Finance (public, no key required)
  - Google Gemini AI (free tier)
- **Security:**
  - express-rate-limit (rate limiting)
  - helmet (security headers)
  - express-validator (input validation)
  - cors (CORS protection)

### Frontend

- **Framework:** React 18.2.0
- **Build Tool:** Vite 5.0.0
- **Styling:** Custom CSS (dark glassmorphism theme)
- **State:** React hooks

---

## 📊 API Endpoints

| Endpoint | Method | Description | Rate Limit |
|----------|--------|-------------|------------|
| `/biotech` | GET | List biotech companies | 100/15min |
| `/quote?symbol=X` | GET | Stock quote data | 100/15min |
| `/news?symbol=X` | GET | Company news | 100/15min |
| `/news/recent` | GET | Recent news (max 3) | 100/15min |
| `/news/past` | GET | Past news archive | 100/15min |
| `/ask` | POST | AI chatbot | 20/hour |
| `/api/chat` | POST | Legacy AI endpoint | 20/hour |

---

## 🔐 Environment Variables

### Backend (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | Server port |
| `GEMINI_API_KEY` | Yes | - | Google Gemini API key |
| `FRONTEND_URL` | Yes | - | Frontend URL (CORS) |
| `AI_ENABLED` | No | true | Enable AI features |

### Frontend (.env.production)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | - | Backend API URL |

---

## 🚨 Security Notes

### CRITICAL: API Key Management

⚠️ **Old API key exposed:** `AIzaSyB6wHaM5SSyzuHsxdW_Q5NL1Bu_r0iREpI`

**Actions required:**
1. Revoke this key at https://ai.google.dev/
2. Generate a new key
3. Use the new key in production

### Security Best Practices

- ✅ Never commit `.env` files
- ✅ Use environment variables for secrets
- ✅ Rotate API keys every 90 days
- ✅ Monitor rate limit hits in logs
- ✅ Keep dependencies updated (`npm audit`)

---

## 📈 Monitoring

### Check Deployment Status

**Vercel:**
- Dashboard: https://vercel.com/dashboard
- Logs: Project → Deployments → View Logs

**Render:**
- Dashboard: https://dashboard.render.com/
- Logs: Service → Logs tab

### Monitor API Quota

**Google Gemini:**
- Check usage: https://ai.google.dev/
- Free tier: 1,500 requests/day
- Your limit: 20 requests/hour = ~480/day ✅

---

## 🐛 Troubleshooting

### Common Issues

**Problem:** "Failed to fetch" error  
**Solution:** Check `VITE_API_URL` matches backend URL, verify backend is running

**Problem:** CORS error  
**Solution:** Check `FRONTEND_URL` in backend matches frontend URL exactly, redeploy backend

**Problem:** Rate limit exceeded  
**Solution:** Wait 15 minutes (general) or 1 hour (AI), or adjust limits in `server.js`

**Problem:** AI chatbot not working  
**Solution:** Verify `GEMINI_API_KEY` is valid, check quota at https://ai.google.dev/

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed troubleshooting.

---

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- **Yahoo Finance** - Free stock market data API
- **Google Gemini** - AI language model
- **Vercel** - Frontend hosting platform
- **Render** - Backend hosting platform

---

## 📞 Support

**Need help deploying?**

1. Check [QUICK_START.md](QUICK_START.md) for step-by-step guide
2. Review troubleshooting sections in deployment guides
3. Check Vercel/Render documentation
4. Open an issue in this repository

---

## 🎯 Roadmap

Potential future enhancements:

- [ ] User authentication and saved watchlists
- [ ] Email alerts for news/price changes
- [ ] Advanced charting with historical data
- [ ] Portfolio tracking
- [ ] Mobile app (React Native)
- [ ] Real-time WebSocket updates

---

**Ready to deploy?** Start with [QUICK_START.md](QUICK_START.md)!

**Last Updated:** December 13, 2025  
**Version:** 1.0.0  
**Status:** 🟢 Production Ready
```
```
The backend will run on `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

### Step 5: Open Your Browser

Visit `http://localhost:5173` to see your dashboard!

## 📝 What You Get

✅ **Dashboard Component** - Shows placeholder metrics and stats  
✅ **Chatbot Component** - AI assistant powered by Claude  
✅ **Backend API** - Simple Express server with Claude integration  
✅ **Modern React Setup** - Using Vite for fast development  
✅ **Vercel Ready** - Configured for easy deployment  

## 🌐 Deploying to Vercel

### Deploy Frontend:
```bash
cd frontend
npm run build
vercel --prod
```

### Deploy Backend:
```bash
cd backend
vercel --prod
```

After deployment:
1. Add `ANTHROPIC_API_KEY` to your Vercel backend environment variables
2. Update frontend API endpoint to point to your backend URL

## 🛠️ Next Steps

- Add real biotech data to the dashboard
- Enhance the chatbot with specific biotech knowledge
- Add authentication
- Create more visualizations
- Add data persistence

## 📚 Learn More

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Vercel Documentation](https://vercel.com/docs)
