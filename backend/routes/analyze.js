// POST /api/analyze — sends a transcript to Gemini and returns structured scoring JSON.
const express = require('express')
const { analyzeTranscript } = require('../services/gemini')

const router = express.Router()

router.post('/', async (req, res, next) => {
  const { transcript, topic, mode, durationSeconds } = req.body || {}

  if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
    return res.status(400).json({ error: 'A non-empty "transcript" string is required.' })
  }
  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'A "topic" string is required.' })
  }

  try {
    const analysis = await analyzeTranscript({
      transcript,
      topic,
      mode: ['practice', 'hr', 'debate'].includes(mode) ? mode : 'practice',
      durationSeconds: Number(durationSeconds) || 0,
    })
    res.json({ analysis })
  } catch (err) {
    next(err)
  }
})

module.exports = router
