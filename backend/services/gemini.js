// Wraps Google Gemini calls for speech analysis and debate mode.
// All prompts instruct Gemini to return ONLY JSON matching a fixed schema so the
// route handlers can parse it directly without extra NLP glue code.
const { GoogleGenerativeAI } = require('@google/generative-ai')

let genAI = null
function getModel() {
  if (!process.env.GEMINI_API_KEY) {
    throw Object.assign(new Error('Server is missing GEMINI_API_KEY. Set it in backend/.env.'), { status: 500 })
  }
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  })
}

/** Strips markdown code fences in case the model ignores responseMimeType. */
function cleanJson(text) {
  return text.replace(/```json/gi, '').replace(/```/g, '').trim()
}

const ANALYSIS_SCHEMA_HINT = `{
  "overallScore": number (0-100),
  "confidenceScore": number (0-100),
  "fluencyScore": number (0-100),
  "grammarScore": number (0-100),
  "vocabularyScore": number (0-100),
  "structureScore": number (0-100),
  "strengths": string[] (3-5 concise bullet points),
  "weaknesses": string[] (3-5 concise bullet points),
  "fillerWords": [{ "word": string, "count": number }] (detected filler words like "um", "like", "you know"),
  "suggestions": string[] (3-5 concrete, actionable next steps)
}`

function buildAnalysisPrompt({ transcript, topic, mode, durationSeconds }) {
  const modeContext =
    mode === 'hr'
      ? 'This is a mock HR interview answer. Evaluate it as a hiring manager would: clarity, relevance, structure (e.g. STAR method), and confidence.'
      : mode === 'debate'
      ? 'This is a debate rebuttal. Evaluate persuasiveness, logical structure, use of evidence/reasoning, and how directly it engages with the opposing argument.'
      : 'This is a public speaking practice session. Evaluate clarity, confidence, grammar, vocabulary, logical flow, storytelling, and persuasiveness.'

  return `You are an expert public speaking coach analyzing a speech transcript.

${modeContext}

Topic/prompt: "${topic}"
Spoken duration: ${durationSeconds} seconds
Transcript:
"""
${transcript}
"""

Analyze the transcript for clarity, confidence, grammar, vocabulary, logical flow, storytelling, persuasiveness, and filler word usage.

Respond with ONLY valid JSON (no markdown, no commentary) matching exactly this schema:
${ANALYSIS_SCHEMA_HINT}

Scoring guidance: be honest and specific, not uniformly generous. A rambling or very short transcript should score low on structure and fluency. Base fillerWords strictly on words that actually appear in the transcript.`
}

async function analyzeTranscript(params) {
  const model = getModel()
  const result = await model.generateContent(buildAnalysisPrompt(params))
  const text = result.response.text()
  const parsed = JSON.parse(cleanJson(text))
  return normalizeAnalysis(parsed)
}

/** Clamp scores to 0-100 and guarantee arrays exist, in case the model drifts from schema. */
function normalizeAnalysis(a) {
  const clamp = (n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)))
  return {
    overallScore: clamp(a.overallScore),
    confidenceScore: clamp(a.confidenceScore),
    fluencyScore: clamp(a.fluencyScore),
    grammarScore: clamp(a.grammarScore),
    vocabularyScore: clamp(a.vocabularyScore),
    structureScore: clamp(a.structureScore),
    strengths: Array.isArray(a.strengths) ? a.strengths.slice(0, 6) : [],
    weaknesses: Array.isArray(a.weaknesses) ? a.weaknesses.slice(0, 6) : [],
    fillerWords: Array.isArray(a.fillerWords)
      ? a.fillerWords.filter((f) => f && f.word).slice(0, 10)
      : [],
    suggestions: Array.isArray(a.suggestions) ? a.suggestions.slice(0, 6) : [],
  }
}

async function generateDebateArgument({ topic, stance }) {
  const model = getModel()
  const aiStance = stance === 'for' ? 'against' : 'for' // AI takes the opposing side
  const prompt = `You are a skilled debater. Write a compelling opening argument ${aiStance} the following motion:

"${topic}"

Keep it to 3-5 sentences, persuasive and well-reasoned, written as if spoken aloud in a debate.
Respond with ONLY valid JSON matching: { "argument": string }`
  const result = await model.generateContent(prompt)
  const parsed = JSON.parse(cleanJson(result.response.text()))
  return parsed.argument?.trim() || ''
}

async function evaluateDebateResponse({ topic, aiArgument, userResponse }) {
  const model = getModel()
  const prompt = `You are judging a debate round.

Motion: "${topic}"
The AI's opening argument was:
"""
${aiArgument}
"""

The human debater's rebuttal was:
"""
${userResponse}
"""

Evaluate the rebuttal for persuasiveness, logical structure, how directly it engages with the AI's points, clarity, confidence, and grammar.

Respond with ONLY valid JSON (no markdown, no commentary) matching exactly this schema:
${ANALYSIS_SCHEMA_HINT}`
  const result = await model.generateContent(prompt)
  const parsed = JSON.parse(cleanJson(result.response.text()))
  return normalizeAnalysis(parsed)
}

module.exports = { analyzeTranscript, generateDebateArgument, evaluateDebateResponse }
