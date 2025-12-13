# Biotech Intelligence Dashboard

A real-time dashboard for tracking biotech company stock data and AI-powered insights.

## ⚠️ Disclaimer

**This application is for informational and educational purposes only. It does not constitute financial advice, investment advice, trading advice, or any other sort of advice. You should not treat any of the information as such. Please consult with a qualified financial advisor before making any investment decisions.**

## Features

- Real-time stock quotes for major biotech companies
- Latest news and updates
- AI-powered insights (powered by Google Gemini)
- Responsive dashboard interface

## Live Demo

- Frontend: https://biotech-intel-dashboard-6f7u.vercel.app
- Backend API: https://biotech-intel-dashboard.vercel.app

## Tech Stack

**Frontend:**
- React 18
- Vite
- Modern CSS

**Backend:**
- Node.js
- Express
- Yahoo Finance API
- Google Gemini AI

## Local Development

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

**Backend:**
- `GEMINI_API_KEY` - Your Google Gemini API key
- `FRONTEND_URL` - Your frontend URL (for CORS)
- `AI_ENABLED` - Enable/disable AI features (default: true)

**Frontend:**
- `VITE_API_URL` - Your backend API URL

## License

MIT
