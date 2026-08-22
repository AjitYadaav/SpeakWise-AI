// Wraps the OpenAI Whisper transcription call so route handlers stay thin.
const OpenAI = require('openai')
const fs = require('fs')

let client = null
function getClient() {
  if (!client) {
    // if (!process.env.OPENAI_API_KEY) {
    //   throw Object.assign(new Error('Server is missing OPENAI_API_KEY. Set it in backend/.env.'), { status: 500 })
    // }
    if (!process.env.GROQ_API_KEY) {
      throw Object.assign(new Error('Server is missing GROQ_API_KEY. Set it in backend/.env.'), { status: 500 })
    }
    // client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    client = new OpenAI({
          apiKey: process.env.GROQ_API_KEY,
          baseURL: 'https://api.groq.com/openai/v1',
    })
  }
  return client
}

/**
 * Transcribes an audio file on disk using OpenAI's Whisper model.
 * @param {string} filePath - path to the temporary uploaded audio file
 * @returns {Promise<string>} the transcript text
 */
async function transcribeAudioFile(filePath) {
  const openai = getClient()
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    // model: 'whisper-1',
    model: 'whisper-large-v3-turbo',
    response_format: 'json',
  })
  return transcription.text?.trim() || ''
}

module.exports = { transcribeAudioFile }
