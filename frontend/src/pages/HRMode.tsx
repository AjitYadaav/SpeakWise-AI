import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import RecorderPanel from '../components/RecorderPanel'
import CircularProgress from '../components/CircularProgress'
import { useTimer } from '../hooks/useTimer'
import { useApp } from '../context/AppContext'
import { HR_QUESTIONS } from '../data/hrQuestions'
import { transcribeAudio, analyzeSpeech } from '../services/api'
import { playTimerStart, playTimerEnd } from '../utils/sound'
import type { HRQuestion } from '../types'

type Stage = 'setup' | 'prep' | 'record' | 'transcribing' | 'transcript' | 'analyzing' | 'error'

export default function HRMode() {
  const navigate = useNavigate()
  const { completeSpeech } = useApp()

  const [question, setQuestion] = useState<HRQuestion | null>(null)
  const [stage, setStage] = useState<Stage>('setup')
  const [transcript, setTranscript] = useState('')
  const [audioDuration, setAudioDuration] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const prepTimer = useTimer({
    durationSeconds: 45,
    onComplete: () => {
      playTimerEnd()
      setStage('record')
    },
  })

  function startPrep() {
    playTimerStart()
    setStage('prep')
    prepTimer.start()
  }

  async function handleRecordingFinished(blob: Blob, durationSeconds: number) {
    setAudioDuration(durationSeconds)
    setStage('transcribing')
    try {
      const text = await transcribeAudio(blob)
      setTranscript(text)
      setStage('transcript')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Transcription failed.')
      setStage('error')
    }
  }

  async function runAnalysis() {
    if (!question) return
    setStage('analyzing')
    try {
      const analysis = await analyzeSpeech({ transcript, topic: question.question, mode: 'hr', durationSeconds: audioDuration })
      const record = completeSpeech({
        mode: 'hr',
        topic: question.question,
        date: new Date().toISOString(),
        durationSeconds: audioDuration,
        transcript,
        analysis,
      })
      navigate(`/results/${record.id}`)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Analysis failed.')
      setStage('error')
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-28">
      <p className="eyebrow mb-4">HR Interview</p>

      {stage === 'setup' && (
        <div className="flex w-full flex-col items-center gap-3">
          {HR_QUESTIONS.map((q) => (
            <button
              key={q.id}
              onClick={() => setQuestion(q)}
              className={`w-full rounded-xl border px-5 py-3.5 text-left text-sm transition-colors ${
                question?.id === q.id ? 'border-ember-500/40 bg-ember-500/[0.06] text-slate-100' : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-slate-200'
              }`}
            >
              {q.question}
            </button>
          ))}

          {question && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-center">
              <p className="text-xs text-slate-500">{question.tip}</p>
            </motion.div>
          )}

          {question && (
            <button onClick={startPrep} className="btn-primary mt-6">
              Start 45s Prep
            </button>
          )}
        </div>
      )}

      {stage === 'prep' && question && (
        <div className="flex flex-col items-center gap-8">
          <p className="text-topic max-w-md text-center text-2xl">{question.question}</p>
          <CircularProgress progressPct={prepTimer.progressPct} size={130} strokeWidth={4}>
            <span className="font-mono text-2xl font-light text-slate-200">{prepTimer.secondsRemaining}</span>
          </CircularProgress>
        </div>
      )}

      {stage === 'record' && question && (
        <div className="flex flex-col items-center gap-8">
          <p className="text-topic max-w-md text-center text-2xl">{question.question}</p>
          <RecorderPanel speechDuration={120} onFinished={handleRecordingFinished} autoStart />
        </div>
      )}

      {stage === 'transcribing' && <QuietLoader label="Transcribing…" />}

      {stage === 'transcript' && (
        <div className="flex w-full flex-col gap-4">
          <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={8} className="input-field text-sm leading-relaxed" />
          <button onClick={runAnalysis} className="btn-primary self-center" disabled={!transcript.trim()}>
            <Sparkles size={14} /> AI Feedback
          </button>
        </div>
      )}

      {stage === 'analyzing' && <QuietLoader label="Evaluating your answer…" />}

      {stage === 'error' && <p className="text-sm text-rose-400/90">{errorMsg}</p>}
    </div>
  )
}

function QuietLoader({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-ember-400" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  )
}
