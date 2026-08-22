# API Documentation

Base URL (local): `http://localhost:8080`
Base URL (production): your deployed Render URL, e.g. `https://speakwise-ai-backend.onrender.com`

All endpoints are prefixed with `/api`. All JSON endpoints expect and return
`Content-Type: application/json` unless noted otherwise. Errors follow a
consistent shape:

```json
{ "error": "Human-readable description of what went wrong." }
```

Rate limit: 20 requests per minute per client IP across all `/api/*` routes
(`express-rate-limit`), returning `429` with a JSON error body when exceeded.

---

## `GET /api/health`

Simple liveness check.

**Response `200`**
```json
{ "status": "ok", "service": "speakwise-ai-backend", "timestamp": "2026-08-22T10:00:00.000Z" }
```

---

## `POST /api/transcribe`

Transcribes an audio recording using OpenAI Whisper.

**Request:** `multipart/form-data`

| Field | Type | Required | Notes |
|---|---|---|---|
| `audio` | File | Yes | webm or mp4 audio, up to 25MB |

**Response `200`**
```json
{ "transcript": "Today I want to talk about..." }
```

**Errors**
- `400` — no file uploaded
- `500` — missing `OPENAI_API_KEY`, or the Whisper API call failed

**Example (curl)**
```bash
curl -X POST http://localhost:8080/api/transcribe \
  -F "audio=@speech.webm"
```

---

## `POST /api/analyze`

Sends a transcript to Gemini for structured speech analysis.

**Request body**
```json
{
  "transcript": "Today I want to talk about...",
  "topic": "Should social media be regulated more strictly?",
  "mode": "practice",
  "durationSeconds": 118
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `transcript` | string | Yes | Non-empty |
| `topic` | string | Yes | The prompt/question being answered |
| `mode` | `"practice"` \| `"hr"` \| `"debate"` | No | Defaults to `"practice"`; changes the evaluation rubric/prompt |
| `durationSeconds` | number | No | Used as scoring context, defaults to 0 |

**Response `200`**
```json
{
  "analysis": {
    "overallScore": 78,
    "confidenceScore": 82,
    "fluencyScore": 75,
    "grammarScore": 88,
    "vocabularyScore": 71,
    "structureScore": 70,
    "strengths": ["Clear opening hook", "Confident tone throughout"],
    "weaknesses": ["Conclusion trails off", "Limited concrete examples"],
    "fillerWords": [{ "word": "um", "count": 4 }, { "word": "like", "count": 2 }],
    "suggestions": ["Add a concrete example in the middle section", "End with a clear call to action"]
  }
}
```

**Errors**
- `400` — missing `transcript` or `topic`
- `500` — missing `GEMINI_API_KEY`, or Gemini returned invalid JSON

---

## `POST /api/debate/prompt`

Generates the AI's opening argument for a debate motion, taking the side
**opposite** the user's chosen stance.

**Request body**
```json
{ "topic": "Social media should be banned for users under 16.", "stance": "for" }
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `topic` | string | Yes | The debate motion |
| `stance` | `"for"` \| `"against"` | Yes | The **user's** stance; the AI argues the opposite side |

**Response `200`**
```json
{ "argument": "Consider that teenagers today face..." }
```

---

## `POST /api/debate/evaluate`

Scores the user's rebuttal against the AI's opening argument.

**Request body**
```json
{
  "topic": "Social media should be banned for users under 16.",
  "aiArgument": "Consider that teenagers today face...",
  "userResponse": "While mental health concerns are real, an outright ban..."
}
```

**Response `200`** — same `AIAnalysis` shape as `/api/analyze`.

---

## Environment Variables (backend)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default `8080`) | Port the Express server listens on |
| `CORS_ORIGIN` | Yes in production | Comma-separated list of allowed frontend origins |
| `OPENAI_API_KEY` | Yes | Used by `/api/transcribe` |
| `GEMINI_API_KEY` | Yes | Used by `/api/analyze` and `/api/debate/*` |
| `GEMINI_MODEL` | No (default `gemini-1.5-flash`) | Override the Gemini model name |

## Environment Variables (frontend)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | No in dev (proxy handles it) | Backend origin to call in production, e.g. `https://speakwise-ai-backend.onrender.com` |
