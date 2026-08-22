import type { AIAnalysis, SessionMode } from '../types'

// In dev, Vite proxies /api to the Express backend (see vite.config.ts).
// In production, set VITE_API_BASE_URL to your deployed backend origin (e.g. Render URL).
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

async function parseJsonOrThrow(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed with status ${res.status}`)
  }
  return res.json()
}

/** Sends recorded audio to the backend, which forwards it to OpenAI Whisper for transcription. */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData()
  const extension = audioBlob.type.includes('mp4') ? 'mp4' : 'webm'
  formData.append('audio', audioBlob, `speech.${extension}`)

  const res = await fetch(`${API_BASE}/api/transcribe`, {
    method: 'POST',
    body: formData,
  })
  const data = await parseJsonOrThrow(res)
  return data.transcript as string
}

/** Sends a transcript to the backend, which forwards it to Gemini for structured speech analysis. */
export async function analyzeSpeech(params: {
  transcript: string
  topic: string
  mode: SessionMode
  durationSeconds: number
}): Promise<AIAnalysis> {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  const data = await parseJsonOrThrow(res)
  return data.analysis as AIAnalysis
}

/** Asks the backend (Gemini) to generate a debate opening argument for a given motion/stance. */
export async function generateDebateArgument(params: {
  topic: string
  stance: 'for' | 'against'
}): Promise<string> {
  const res = await fetch(`${API_BASE}/api/debate/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  const data = await parseJsonOrThrow(res)
  return data.argument as string
}

/** Asks the backend (Gemini) to evaluate the user's rebuttal in a debate round. */
export async function evaluateDebateResponse(params: {
  topic: string
  aiArgument: string
  userResponse: string
}): Promise<AIAnalysis> {
  const res = await fetch(`${API_BASE}/api/debate/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  const data = await parseJsonOrThrow(res)
  return data.analysis as AIAnalysis
}
