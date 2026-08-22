# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              BROWSER (Client)                           │
│                                                                           │
│   ┌───────────────┐   ┌────────────────┐   ┌─────────────────────────┐ │
│   │  Landing Page │   │  Practice Flow │   │  HR Mode / Debate Mode  │ │
│   │  (marketing)  │   │ Wheel→Prep→Rec │   │  (same rec/analyze flow)│ │
│   └───────────────┘   └───────┬────────┘   └────────────┬────────────┘ │
│                                │                          │              │
│                        ┌───────▼──────────────────────────▼───────┐     │
│                        │      React App (Vite + TS + Tailwind)    │     │
│                        │  MediaRecorder API → audio Blob           │     │
│                        │  AppContext → localStorage (history, XP)  │     │
│                        └───────────────────┬───────────────────────┘     │
└────────────────────────────────────────────┼─────────────────────────────┘
                                              │ fetch() — multipart / JSON
                                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        BACKEND (Node.js + Express)                       │
│                                                                           │
│   POST /api/transcribe   ──►  services/whisper.js  ──►  OpenAI Whisper   │
│   POST /api/analyze      ──►  services/gemini.js   ──►  Google Gemini    │
│   POST /api/debate/*     ──►  services/gemini.js   ──►  Google Gemini    │
│                                                                           │
│   Middleware: CORS allow-list · JSON body parsing · rate limiting        │
└─────────────────────────────────────────────────────────────────────────┘
```

## Request Flow: A Single Practice Session

1. **Topic selection** — the Home page's category dropdown and mode toggle
   (Off The Cuff / Deep Research) filter the local `data/topics.ts` bank
   client-side. Clicking **Generate Topic** triggers `useTopicShuffle`, which
   picks the final topic up front, then rapidly swaps the displayed topic
   through a decelerating schedule of delays (a "slot machine" effect) before
   settling — all driven by `requestAnimationFrame`-free `setTimeout` chains,
   no backend involvement.
2. **Sound** — `utils/sound.ts` synthesizes every effect (click, shuffle tick,
   reveal chime, timer start/end) live via the Web Audio API's
   `OscillatorNode` + `GainNode` envelopes. No audio files are shipped.
3. **Preparation** — `useTimer` runs a local countdown sized by the selected
   mode (`PRACTICE_MODE_CONFIG`); no backend involvement.
4. **Recording** — `useRecorder` wraps `navigator.mediaDevices.getUserMedia` +
   `MediaRecorder`, producing an in-memory audio `Blob` (webm or mp4 depending on
   browser support). A `Web Audio API` `AnalyserNode` samples amplitude data on
   every animation frame to drive the waveform visualization.
4. **Transcription** — the audio blob is POSTed as `multipart/form-data` to
   `/api/transcribe`. The backend writes it to a temp file, calls OpenAI's
   `audio.transcriptions.create` (Whisper), deletes the temp file, and returns
   `{ transcript }`.
5. **Transcript review** — the transcript is shown in an editable `<textarea>`
   so the user can fix any misheard words before scoring.
6. **Analysis** — the (possibly edited) transcript is POSTed as JSON to
   `/api/analyze`. The backend prompts Gemini with a fixed JSON schema
   (`services/gemini.js`) and parses/normalizes the response, clamping scores to
   0–100 and guaranteeing array fields exist even if the model is slightly off-schema.
7. **Persistence** — the resulting `AIAnalysis` object plus transcript/topic/duration
   is saved as a `SpeechRecord` in `localStorage` via `AppContext.completeSpeech()`,
   which also computes XP, updates the streak, and checks for newly unlocked achievements.
8. **Results** — the user is routed to `/results/:id`, which reads the record
   back out of `AppContext`/`localStorage` and renders the radar chart, score
   cards, filler words, strengths/weaknesses, and improvement plan.

HR Mode and Debate Mode reuse the same recording → transcribe → analyze pipeline,
swapping in different prompts/questions and, for Debate Mode, an extra step where
Gemini first generates an opposing opening argument (`/api/debate/prompt`) before
the user's rebuttal is evaluated (`/api/debate/evaluate`).

## Why `localStorage` for the MVP

The brief scopes storage to `localStorage`, which keeps the app deployable with
zero database setup and no auth. The tradeoff: history is per-browser, not
per-account, and doesn't survive clearing site data. `frontend/src/utils/storage.ts`
is the single module that touches `localStorage` — swapping it for `fetch` calls to
a real backend (with a database and auth) means changing that one file plus adding
persistence routes on the backend; no other frontend code needs to change since
everything goes through `AppContext`.

## Why the AI calls are proxied through a backend

Both the OpenAI and Gemini API keys are secrets that must never ship to the
browser. The Express backend exists specifically to hold those keys server-side
and act as a thin, rate-limited proxy: the frontend never talks to OpenAI or
Google directly.

## Key Design Decisions

- **Two separate AI providers**: Whisper is best-in-class purely for
  speech-to-text; Gemini is used for the analytical/JSON-structured reasoning
  task. Using each for what it's strongest at keeps quality high without paying
  for a single provider to do everything.
- **`responseMimeType: 'application/json'`** is set on the Gemini model config
  so it returns JSON directly; the code still defensively strips markdown code
  fences in case a future model version reintroduces them.
- **Normalization layer** (`normalizeAnalysis` in `gemini.js`) protects the
  frontend from a slightly malformed AI response — scores are clamped and
  arrays default to `[]` rather than `undefined`, so the Results page never
  crashes on a `.map()` over `undefined`.
- **Shared `RecorderPanel` component**: Practice, HR, and Debate modes are
  functionally "record N seconds of audio and hand back a blob" — building
  this once and reusing it avoids three slightly-different recording
  implementations drifting out of sync.

## Data Model (frontend `types/index.ts`)

```ts
SpeechRecord {
  id, mode, topic, category?, date, durationSeconds,
  transcript, analysis: AIAnalysis | null, xpEarned
}

AIAnalysis {
  overallScore, confidenceScore, fluencyScore, grammarScore,
  vocabularyScore, structureScore,
  strengths[], weaknesses[], fillerWords[{word,count}], suggestions[]
}

UserProgress {
  xp, level, streakDays, lastPracticeDate, totalSpeeches, achievements[]
}
```
