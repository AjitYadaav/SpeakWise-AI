# Installation Guide

## Prerequisites

- **Node.js** 18 or later (check with `node -v`)
- **npm** 9 or later
- An **OpenAI API key** with Whisper access
- A **Google Gemini API key**
- A modern browser with microphone access (Chrome, Edge, or Firefox recommended — Safari's `MediaRecorder` support is more limited)

## 1. Clone / unzip the project

```bash
cd speakwise-ai
```

You should see two top-level app folders: `frontend/` and `backend/`.

## 2. Backend setup

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in:

```env
PORT=8080
CORS_ORIGIN=http://localhost:5173

OPENAI_API_KEY=sk-...your-key...
GEMINI_API_KEY=...your-key...
GEMINI_MODEL=gemini-1.5-flash
```

Install dependencies and start the server:

```bash
npm install
npm run dev
```

You should see:

```
SpeakWise AI backend listening on port 8080
```

Verify it's alive: open http://localhost:8080/api/health — you should get a JSON `{"status":"ok", ...}` response.

## 3. Frontend setup

In a **second terminal**:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

`VITE_API_BASE_URL` can stay empty for local dev — Vite's dev server proxies any request to
`/api/*` straight to `http://localhost:8080` (configured in `vite.config.ts`).

Open http://localhost:5173 in your browser.

## 4. Grant microphone permission

The first time you click **Start Recording**, your browser will prompt for microphone
access. Accept it. If you accidentally deny it, re-enable it from your browser's site
settings (the padlock icon in the address bar) and reload the page.

## 5. Try the full loop

1. Go to **Practice**, spin the wheel or shuffle a topic.
2. Choose a prep time and speech length, then start prep.
3. Record your speech.
4. Review/edit the Whisper transcript.
5. Click **Analyze with Gemini** to get your scores.
6. Check **History** and **Progress** to see it saved and your XP updated.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| "Microphone access failed" | Browser permission denied, or no mic detected | Check browser site settings; try a different browser |
| `500` from `/api/transcribe` | Missing/invalid `OPENAI_API_KEY` | Double check `backend/.env` and restart the backend |
| `500` from `/api/analyze` | Missing/invalid `GEMINI_API_KEY`, or Gemini returned non-JSON | Check the backend console logs for the raw error |
| CORS error in the browser console | Frontend origin not in `CORS_ORIGIN` | Add your frontend URL (comma-separated for multiple) to `backend/.env` and restart |
| Blank wheel / no topics | Build issue with `data/topics.ts` | Run `npm run build` in `frontend/` to surface any TypeScript errors |

## Building for production

```bash
# Frontend
cd frontend
npm run build       # outputs static files to frontend/dist

# Backend
cd backend
npm start            # runs the server directly (no build step needed for plain Node/Express)
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for hosting these on Vercel and Render.
