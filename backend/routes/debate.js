// POST /api/debate/prompt   — Gemini generates an opposing opening argument for a motion.
// POST /api/debate/evaluate — Gemini scores the user's rebuttal against that argument.
const express = require('express')
const { generateDebateArgument, evaluateDebateResponse } = require('../services/gemini')

const router = express.Router()

router.post('/prompt', async (req, res, next) => {
  const { topic, stance } = req.body || {}
  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'A "topic" string is required.' })
  }
  if (!['for', 'against'].includes(stance)) {
    return res.status(400).json({ error: '"stance" must be either "for" or "against".' })
  }

  try {
    const argument = await generateDebateArgument({ topic, stance })
    res.json({ argument })
  } catch (err) {
    next(err)
  }
})

router.post('/evaluate', async (req, res, next) => {
  const { topic, aiArgument, userResponse } = req.body || {}
  if (!topic || !aiArgument || !userResponse) {
    return res.status(400).json({ error: '"topic", "aiArgument", and "userResponse" are all required.' })
  }

  try {
    const analysis = await evaluateDebateResponse({ topic, aiArgument, userResponse })
    res.json({ analysis })
  } catch (err) {
    next(err)
  }
})

module.exports = router
