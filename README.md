# SpeakWise AI 🎙️

Practice speaking. Think faster. Communicate better.

SpeakWise AI is an AI-powered public speaking platform designed to help users improve communication skills through deliberate practice, instant feedback, and real-world speaking scenarios.

Whether you're preparing for interviews, presentations, debates, group discussions, or simply trying to become a more confident speaker, SpeakWise AI provides a structured environment to practice and improve.

---

## 🚀 Live Features

### 🎯 Random Topic Generator

Generate unique speaking prompts instantly across multiple categories:

- Communication
- Psychology
- Business
- Science
- Technology
- Ethics
- History
- Motivation
- Education
- Current Affairs

Topics are presented with smooth animations and audio feedback to create an engaging speaking experience.

---

### 🧠 Off-The-Cuff Mode

Think on your feet.

Users receive a random topic and must immediately begin speaking with little or no preparation time.

Perfect for:

- Extempore speaking
- Group discussions
- Communication practice
- Quick-thinking exercises

---

### 🔍 Deep Research Mode

Take time to prepare before speaking.

Users receive a topic, research it, organize their thoughts, and then deliver a structured response.

Perfect for:

- Presentations
- Technical explanations
- Academic speaking
- Public speaking competitions

---

### 🎤 Speech Recording

Record responses directly from the browser using microphone access.

Features:

- Live recording
- Audio capture
- Session tracking
- Review before analysis

---

### 📝 Speech-to-Text Transcription

Recorded speech is automatically converted into text using AI-powered transcription.

Current implementation:

- Groq Whisper Large V3 Turbo

Benefits:

- Fast transcription
- High accuracy
- Supports natural speech patterns

---

### 🤖 AI Speech Analysis

After transcription, Google Gemini analyzes the speech and provides detailed feedback.

Evaluation includes:

- Confidence Score
- Fluency Score
- Grammar Score
- Vocabulary Score
- Structure Score
- Overall Performance Score

---

### 📊 Detailed Feedback Report

Receive actionable insights including:

#### Strengths

Highlights what was done well.

Examples:

- Strong introduction
- Clear structure
- Good vocabulary usage

#### Areas for Improvement

Identifies weaknesses.

Examples:

- Repetitive phrases
- Weak conclusion
- Lack of examples

#### Filler Word Detection

Tracks usage of:

- Um
- Uh
- Like
- You know
- Basically

and other common fillers.

#### Improvement Suggestions

Provides personalized recommendations for future practice sessions.

---

### 💼 HR Interview Mode

Practice real interview questions.

Examples:

- Tell me about yourself
- Why should we hire you?
- What are your strengths and weaknesses?
- Describe a challenging situation

The system evaluates answers similarly to how recruiters evaluate candidates.

Focus areas:

- Clarity
- Confidence
- Communication
- Structure
- Relevance

---

### ⚖️ Debate Mode

Practice defending your ideas.

Workflow:

1. AI generates an argument.
2. User responds with a rebuttal.
3. AI evaluates the response.

Assessment includes:

- Logical reasoning
- Persuasiveness
- Counterarguments
- Communication quality
- Debate structure

---

### 💾 Session History

All practice sessions are saved locally.

Users can:

- Review previous attempts
- Compare performance
- Re-analyze transcripts
- Track improvement over time

---

## 🏗️ Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Recharts
- Web Audio API

### Backend

- Node.js
- Express.js

### AI Services

#### Speech-to-Text

- Groq Whisper Large V3 Turbo

#### Speech Analysis

- Google Gemini

### Storage

- Browser Local Storage (MVP)

---

## 📂 Project Structure

```text
speakwise-ai/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/
│   │   ├── data/
│   │   ├── types/
│   │   └── utils/
│   │
│   └── public/
│
├── backend/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── server.js
│
└── docs/
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/speakwise-ai.git

cd speakwise-ai
```

### Backend Setup

```bash
cd backend

npm install
```

Create `.env`

```env
PORT=8080

GROQ_API_KEY=your_groq_api_key

GEMINI_API_KEY=your_gemini_api_key

GEMINI_MODEL=gemini-2.5-flash
```

Run backend:

```bash
npm run dev
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Open:

```text
http://localhost:5173
```

---

## 🔑 API Keys

### Groq

Used for speech transcription.

Get API key:

https://console.groq.com/keys

---

### Google Gemini

Used for speech analysis and debate evaluation.

Get API key:

https://aistudio.google.com/app/apikey

---

## 🌟 Future Roadmap

### Authentication

- User accounts
- Login / Signup
- OAuth support

### Cloud Storage

- Save recordings
- Access from any device

### Analytics Dashboard

- Weekly progress reports
- Performance trends
- Communication insights

### AI Coach

- Personalized speaking plans
- Custom exercises
- Communication goals

### Real-Time Analysis

- Live transcription
- Live speaking feedback
- Real-time filler word detection

### Community Features

- Peer reviews
- Public challenges
- Leaderboards

---

## 📈 Why This Project?

Many people struggle with:

- Public speaking
- Interviews
- Debates
- Communication confidence

SpeakWise AI was built to provide an accessible platform where anyone can practice speaking regularly and receive meaningful AI-powered feedback.

The goal is simple:

> Help people become more confident communicators through deliberate practice.

---

## 👨‍💻 Author

### Ajit Yadav

Built with the vision of helping students, professionals, and lifelong learners improve communication skills through technology and AI.
