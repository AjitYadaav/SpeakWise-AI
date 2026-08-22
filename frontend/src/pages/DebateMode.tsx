import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Shuffle } from 'lucide-react'
import RecorderPanel from '../components/RecorderPanel'
import { useApp } from '../context/AppContext'
import { DEBATE_MOTIONS } from '../data/debateTopics'
import { transcribeAudio, generateDebateArgument, evaluateDebateResponse } from '../services/api'

type Stage = 'setup' | 'generating' | 'record' | 'transcribing' | 'transcript' | 'analyzing' | 'error'

export default function DebateMode() {
  const navigate = useNavigate()
  const { completeSpeech } = useApp()

  const [motion, setMotion] = useState<string | null>(null)
  const [stance, setStance] = useState<'for' | 'against'>('for')
  const [aiArgument, setAiArgument] = useState('')
  const [stage, setStage] = useState<Stage>('setup')
  const [transcript, setTranscript] = useState('')
  const [audioDuration, setAudioDuration] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function pickRandomMotion() {
    setMotion(DEBATE_MOTIONS[Math.floor(Math.random() * DEBATE_MOTIONS.length)])
  }

  async function startDebate() {
    if (!motion) return
    setStage('generating')
    try {
      const argument = await generateDebateArgument({ topic: motion, stance })
      setAiArgument(argument)
      setStage('record')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not generate the AI argument.')
      setStage('error')
    }
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

  async function runEvaluation() {
    if (!motion) return
    setStage('analyzing')
    try {
      const analysis = await evaluateDebateResponse({ topic: motion, aiArgument, userResponse: transcript })
      const record = completeSpeech({
        mode: 'debate',
        topic: motion,
        date: new Date().toISOString(),
        durationSeconds: audioDuration,
        transcript,
        analysis,
      })
      navigate(`/results/${record.id}`)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Evaluation failed.')
      setStage('error')
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-28">
      <p className="eyebrow mb-4">Debate</p>

      {stage === 'setup' && (
        <div className="flex w-full flex-col items-center gap-3">
          {DEBATE_MOTIONS.slice(0, 6).map((m) => (
            <button
              key={m}
              onClick={() => setMotion(m)}
              className={`w-full rounded-xl border px-5 py-3.5 text-left text-sm transition-colors ${
                motion === m ? 'border-ember-500/40 bg-ember-500/[0.06] text-slate-100' : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
          <button onClick={pickRandomMotion} className="btn-ghost">
            <Shuffle size={14} /> Random motion
          </button>

          {motion && (
            <div className="mt-2 flex w-full flex-col items-center gap-4">
              <div className="inline-flex rounded-full border border-white/10 bg-white/[0.02] p-1">
                {(['for', 'against'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStance(s)}
                    className={`rounded-full px-5 py-2 text-sm font-medium capitalize transition-colors ${
                      stance === s ? 'bg-white/[0.08] text-ember-300' : 'text-slate-500'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button onClick={startDebate} className="btn-primary">
                Hear the AI's Argument
              </button>
            </div>
          )}
        </div>
      )}

      {stage === 'generating' && <QuietLoader label="The AI is preparing its case…" />}

      {stage === 'record' && (
        <div className="flex flex-col items-center gap-8">
          <div className="surface max-w-md p-5 text-sm leading-relaxed text-slate-300">{aiArgument}</div>
          <p className="text-xs text-slate-500">Now record your rebuttal, arguing {stance} the motion.</p>
          <RecorderPanel speechDuration={120} onFinished={handleRecordingFinished} autoStart />
        </div>
      )}

      {stage === 'transcribing' && <QuietLoader label="Transcribing your rebuttal…" />}

      {stage === 'transcript' && (
        <div className="flex w-full flex-col gap-4">
          <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={8} className="input-field text-sm leading-relaxed" />
          <button onClick={runEvaluation} className="btn-primary self-center" disabled={!transcript.trim()}>
            <Sparkles size={14} /> Evaluate Rebuttal
          </button>
        </div>
      )}

      {stage === 'analyzing' && <QuietLoader label="Judging the strength of your case…" />}

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
