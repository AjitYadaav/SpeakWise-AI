# SpeakWise AI 🎙️

A calm, minimal AI-powered public speaking practice tool. Generate a topic, think
it through, and speak — in **Off The Cuff** or **Deep Research** mode — then get
quiet, structured AI feedback on confidence, fluency, grammar, vocabulary, and
structure.

The interface is deliberately spare: a full-screen dark gradient, elegant serif
topic typography, and just three actions — Start Timer, Start Recording, AI
Feedback. No wheels, no charts on the landing screen, no gamification. The goal
is a space that feels like thinking, not a game.

![SpeakWise AI](https://img.shields.io/badge/status-MVP-D4AF6A) ![License](https://img.shields.io/badge/license-MIT-7AAB97)

## ✨ Features

| Area | What it does |
|---|---|
| **Topic Generation** | Click Generate — a soft click sound plays, topics rapidly cycle and ease to a stop, then a gentle reveal chime plays as the final topic scales and fades in |
| **Two Modes** | **Off The Cuff** (short prep, spontaneous) and **Deep Research** (longer prep window) — each with its own timing |
| **Category Filter** | A quiet dropdown across 10 categories and 1,900+ topics — no wheel |
| **Synthesized Sound** | Every sound effect (click, shuffle, reveal, timer start/end) is generated live with the Web Audio API — zero audio files |
| **Speech Recording** | Browser `MediaRecorder` capture with a minimal live waveform |
| **Speech-to-Text** | Recorded audio is transcribed via OpenAI Whisper, editable before analysis |
| **AI Speech Analysis** | Gemini scores 6 dimensions and returns strengths, weaknesses, filler words, and suggestions as structured JSON |
| **Results** | A quiet, focused results view — score cards, a radar chart, and an improvement plan, no dashboards |
| **Sessions** | Every session saved to `localStorage` — searchable, deletable, re-analyzable |
| **HR Interview Mode** | Practice classic interview questions with the same record → transcribe → analyze pipeline |
| **Debate Mode** | Gemini opens with an argument on one side of a motion; you rebut and get scored |

## 🧱 Tech Stack

**Frontend:** React 18 · TypeScript · Vite · Tailwind CSS · Framer Motion · Recharts · React Router · Web Audio API
**Backend:** Node.js · Express
**AI:** OpenAI Whisper (speech-to-text) · Google Gemini (speech analysis, debate)
**Storage:** `localStorage` for the MVP (see [Architecture](docs/ARCHITECTURE.md) for how to swap in a real database)

## 🎨 Design Direction

The visual language takes cues from calm, focused speaking-practice tools:
a full-viewport dark green-black gradient background, an italic serif
(`Fraunces`) for the topic itself — the only large, high-contrast text on the
page — and a single warm gold accent used sparingly for focus states. There is
no persistent chrome beyond a faint top nav; every other page (Sessions, HR
Interview, Debate, Results) reuses the same restrained surfaces, buttons, and
typography so the whole app feels like one quiet room, not a suite of screens.

## 📁 Project Structure

```
speakwise-ai/
├── frontend/               # React + TypeScript + Vite app
│   ├── src/
│   │   ├── components/     # Shared UI (Navbar, ModeToggle, RecorderPanel, charts, ...)
│   │   ├── pages/          # Home (topic generation + practice flow), Results, History, HR, Debate
│   │   ├── data/            # Topic bank, HR questions, debate motions
│   │   ├── hooks/            # useRecorder, useTimer, useTopicShuffle
│   │   ├── context/          # AppContext (session history only — no gamification)
│   │   ├── services/         # api.ts — fetch wrappers for the backend
│   │   ├── utils/             # storage.ts, sound.ts (Web Audio synthesis)
│   │   └── types/              # Shared TypeScript types
│   └── ...config files
├── backend/                # Node + Express API
│   ├── routes/              # transcribe.js, analyze.js, debate.js
│   ├── services/            # whisper.js, gemini.js
│   └── server.js
└── docs/                    # This documentation set
```

## 🚀 Quick Start

See [docs/INSTALLATION.md](docs/INSTALLATION.md) for full setup steps. TL;DR:

```bash
# Backend
cd backend
cp .env.example .env   # then fill in OPENAI_API_KEY and GEMINI_API_KEY
npm install
npm run dev             # http://localhost:8080

# Frontend (in a second terminal)
cd frontend
cp .env.example .env
npm install
npm run dev             # http://localhost:5173
```

Open http://localhost:5173 — the Vite dev server proxies `/api` calls to the backend automatically.

## 📚 Documentation

- [Installation Guide](docs/INSTALLATION.md) — local setup, environment variables, running both servers
- [Architecture](docs/ARCHITECTURE.md) — system diagram, data flow, and design decisions
- [API Documentation](docs/API_DOCS.md) — every backend endpoint, request/response shapes
- [Deployment Guide](docs/DEPLOYMENT.md) — Vercel (frontend) + Render (backend) step-by-step

## 🔑 Getting API Keys

- **OpenAI (Whisper):** https://platform.openai.com/api-keys
- **Google Gemini:** https://aistudio.google.com/app/apikey

Both offer usage-based pricing; check current rates before heavy use.

## 🗺️ Roadmap Ideas

- Swap `localStorage` for a real database (Postgres/MongoDB) + user accounts
- Server-side audio storage (S3) so speeches can be replayed later
- Real-time streaming transcription during recording
- Peer/coach review mode

## 📄 License

MIT — do whatever you'd like with this, attribution appreciated but not required.
