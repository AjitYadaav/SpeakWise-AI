// SpeakWise AI backend — Express server.
// Exposes three route groups: transcription (Whisper), analysis (Gemini), and debate (Gemini).
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')

const transcribeRouter = require('./routes/transcribe')
const analyzeRouter = require('./routes/analyze')
const debateRouter = require('./routes/debate')

const app = express()
const PORT = process.env.PORT || 8080

// --- Middleware -------------------------------------------------------------

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, server-to-server, mobile apps).
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
      callback(new Error(`Origin ${origin} not allowed by CORS`))
    },
  }),
)

app.use(express.json({ limit: '2mb' }))

// Basic rate limiting to protect the (paid) AI API calls from abuse.
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down and try again shortly.' },
})
app.use('/api/', aiLimiter)

// --- Routes -------------------------------------------------------------

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'speakwise-ai-backend', timestamp: new Date().toISOString() })
})

app.use('/api/transcribe', transcribeRouter)
app.use('/api/analyze', analyzeRouter)
app.use('/api/debate', debateRouter)

// --- Error handling -------------------------------------------------------------

app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` })
})

// Centralized error handler — every route below forwards errors here via next(err)
// or by throwing inside an async handler wrapped in a try/catch that calls next.
app.use((err, _req, res, _next) => {
  console.error('[SpeakWise API Error]', err)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`SpeakWise AI backend listening on port ${PORT}`)
})
