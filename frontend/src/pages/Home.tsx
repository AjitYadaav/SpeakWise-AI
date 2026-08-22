import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, Timer as TimerIcon, Mic as MicIcon, Wand2 } from 'lucide-react'
import CircularProgress from '../components/CircularProgress'
import CategorySelect from '../components/CategorySelect'
import RecorderPanel from '../components/RecorderPanel'
import ModeToggle from '../components/ModeToggle'
import { useTimer } from '../hooks/useTimer'
import { useTopicShuffle } from '../hooks/useTopicShuffle'
import { useApp } from '../context/AppContext'
import { TOPICS, TOPIC_CATEGORIES, getTopicsByCategory } from '../data/topics'
import { transcribeAudio, analyzeSpeech } from '../services/api'
import { playClick, playTimerStart, primeAudio } from '../utils/sound'
import { PRACTICE_MODE_CONFIG } from '../types'
import type { PracticeMode, TopicCategory } from '../types'

type Stage = 'idle' | 'timer' | 'record' | 'transcribing' | 'transcript' | 'analyzing' | 'error'

export default function Home() {
  const navigate = useNavigate()
  const { completeSpeech } = useApp()

  const [practiceMode, setPracticeMode] = useState<PracticeMode>('off-the-cuff')
  const [category, setCategory] = useState<TopicCategory | 'all'>('all')
  const [stage, setStage] = useState<Stage>('idle')
  const [transcript, setTranscript] = useState('')
  const [audioDuration, setAudioDuration] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { displayedTopic, isShuffling, shuffle } = useTopicShuffle()

  const pool = useMemo(() => (category === 'all' ? TOPICS : getTopicsByCategory(category)), [category])
  const modeConfig = PRACTICE_MODE_CONFIG[practiceMode]

  const prepTimer = useTimer({
    durationSeconds: modeConfig.prepSeconds,
    onComplete: () => setStage('idle'),
  })

  function handleGenerate() {
    primeAudio()
    playClick()
    setStage('idle')
    setTranscript('')
    shuffle(pool)
  }

  function handleStartTimer() {
    if (!displayedTopic) return
    playTimerStart()
    setStage('timer')
    prepTimer.start()
  }

  function handleStartRecording() {
    if (!displayedTopic) return
    prepTimer.stop()
    setStage('record')
  }

  async function handleRecordingFinished(blob: Blob, durationSeconds: number) {
    setAudioDuration(durationSeconds)
    setStage('transcribing')
    try {
      const text = await transcribeAudio(blob)
      setTranscript(text)
      setStage('transcript')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Transcription failed. Please try again.')
      setStage('error')
    }
  }

  async function handleAIFeedback() {
    if (!displayedTopic || !transcript.trim()) return
    setStage('analyzing')
    try {
      const analysis = await analyzeSpeech({
        transcript,
        topic: displayedTopic.text,
        mode: 'practice',
        durationSeconds: audioDuration,
      })
      const record = completeSpeech({
        mode: 'practice',
        practiceMode,
        topic: displayedTopic.text,
        category: displayedTopic.category,
        date: new Date().toISOString(),
        durationSeconds: audioDuration,
        transcript,
        analysis,
      })
      navigate(`/results/${record.id}`)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
      setStage('error')
    }
  }

  const canFeedback = stage === 'transcript' && transcript.trim().length > 0

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-32">
      {/* Mode + category controls — quiet, above the fold, never competing with the topic */}
      <div className="mb-14 flex flex-col items-center gap-5">
        <ModeToggle mode={practiceMode} onChange={setPracticeMode} />
        <CategorySelect value={category} options={TOPIC_CATEGORIES} onChange={setCategory} />
      </div>

      {/* The topic — the singular focus of the page */}
      <div className="flex min-h-[9rem] w-full max-w-3xl flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {displayedTopic ? (
            <motion.p
              key={isShuffling ? `shuffling-${displayedTopic.id}` : displayedTopic.id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: isShuffling ? 0.06 : 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-topic text-3xl leading-snug sm:text-4xl md:text-[2.75rem]"
            >
              {displayedTopic.text}
            </motion.p>
          ) : (
            <motion.p
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-topic text-2xl text-slate-600 sm:text-3xl"
            >
              Generate a topic to begin.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Generate control */}
      <button onClick={handleGenerate} disabled={isShuffling} className="btn-secondary mt-12 !px-7">
        <Wand2 size={15} />
        {displayedTopic ? 'New Topic' : 'Generate Topic'}
      </button>

      {/* Contextual stage area — timer, recorder, transcript. Only ever one at a time. */}
      <div className="mt-16 w-full max-w-md">
        <AnimatePresence mode="wait">
          {stage === 'timer' && (
            <motion.div
              key="timer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center gap-4"
            >
              <CircularProgress progressPct={prepTimer.progressPct} size={140} strokeWidth={4}>
                <span className="font-mono text-2xl font-light text-slate-200">{prepTimer.secondsRemaining}</span>
              </CircularProgress>
              <p className="text-xs text-slate-500">Gathering your thoughts…</p>
            </motion.div>
          )}

          {stage === 'record' && (
            <motion.div key="record" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <RecorderPanel speechDuration={modeConfig.speechSeconds} onFinished={handleRecordingFinished} autoStart />
            </motion.div>
          )}

          {stage === 'transcribing' && (
            <motion.div
              key="transcribing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-4"
            >
              <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-ember-400" />
              <p className="text-sm text-slate-500">Transcribing your words…</p>
            </motion.div>
          )}

          {stage === 'transcript' && (
            <motion.div
              key="transcript"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col gap-3"
            >
              <p className="eyebrow text-center">Your words, ready to review</p>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={6}
                className="input-field font-body text-sm leading-relaxed"
              />
            </motion.div>
          )}

          {stage === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-4"
            >
              <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-sage-400" />
              <p className="text-sm text-slate-500">Reflecting on your delivery…</p>
            </motion.div>
          )}

          {stage === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <p className="text-sm text-rose-400/90">{errorMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Primary actions — always present once a topic exists, quietly enabling as you progress */}
      {displayedTopic && stage !== 'timer' && stage !== 'record' && (
        <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
          <button onClick={handleStartTimer} disabled={stage !== 'idle'} className="btn-secondary">
            <TimerIcon size={14} /> Start Timer
          </button>
          <button onClick={handleStartRecording} disabled={stage === 'transcribing' || stage === 'analyzing'} className="btn-secondary">
            <MicIcon size={14} /> Start Recording
          </button>
          <button onClick={handleAIFeedback} disabled={!canFeedback} className="btn-primary">
            <Sparkles size={14} /> AI Feedback
          </button>
        </div>
      )}
    </div>
  )
}
