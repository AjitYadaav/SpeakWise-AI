// POST /api/transcribe — accepts an audio file upload and returns a Whisper transcript.
const express = require('express')
const multer = require('multer')
const os = require('os')
const fs = require('fs')
const path = require('path')
const { transcribeAudioFile } = require('../services/whisper')

const router = express.Router()

// Store uploads in the OS temp dir; files are deleted immediately after transcription.
const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB, matches Whisper's file size cap
})

router.post('/', upload.single('audio'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file was uploaded. Expected a multipart field named "audio".' })
  }

  // Whisper infers format from the filename extension, so give the temp file a proper name.
  const ext = path.extname(req.file.originalname) || '.webm'
  const renamedPath = `${req.file.path}${ext}`

  try {
    fs.renameSync(req.file.path, renamedPath)
    const transcript = await transcribeAudioFile(renamedPath)
    res.json({ transcript })
  } catch (err) {
    next(err)
  } finally {
    fs.unlink(renamedPath, () => {}) // best-effort cleanup, ignore errors
  }
})

module.exports = router
