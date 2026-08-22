import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ScoreCard from '../components/ScoreCard'
import RadarChartPanel from '../components/RadarChartPanel'

export default function Results() {
  const { id } = useParams()
  const { history } = useApp()
  const record = history.find((r) => r.id === id)

  if (!record || !record.analysis) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-6 text-slate-500">We couldn't find that session.</p>
        <Link to="/" className="btn-primary">Start a new session</Link>
      </div>
    )
  }

  const a = record.analysis

  return (
    <div className="mx-auto max-w-4xl px-6 py-28">
      <Link to="/history" className="btn-ghost mb-8 !px-0">
        <ArrowLeft size={14} /> Back to sessions
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
        <p className="eyebrow mb-3">{record.category ?? record.mode}</p>
        <h1 className="text-topic text-3xl sm:text-4xl">{record.topic}</h1>
        <p className="mt-3 text-xs text-slate-600">{new Date(record.date).toLocaleString()}</p>
      </motion.div>

      <div className="mb-10 flex flex-col items-center justify-center gap-1 text-center">
        <p className="eyebrow">Overall</p>
        <p className="font-serif text-6xl font-light text-ember-300">{Math.round(a.overallScore)}</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <ScoreCard label="Confidence" score={a.confidenceScore} />
        <ScoreCard label="Fluency" score={a.fluencyScore} />
        <ScoreCard label="Grammar" score={a.grammarScore} />
        <ScoreCard label="Vocabulary" score={a.vocabularyScore} />
        <ScoreCard label="Structure" score={a.structureScore} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RadarChartPanel analysis={a} />

        <div className="surface p-6">
          <h3 className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-500">Filler Words</h3>
          {a.fillerWords.length === 0 ? (
            <p className="text-sm text-slate-500">Clean delivery — nothing notable.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {a.fillerWords.map((f) => (
                <span key={f.word} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-slate-300">
                  "{f.word}" <span className="text-slate-500">×{f.count}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="surface p-6">
          <h3 className="mb-4 text-xs font-medium uppercase tracking-wide text-sage-400">Strengths</h3>
          <ul className="space-y-2.5">
            {a.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-300">
                <span className="text-sage-400">·</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="surface p-6">
          <h3 className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-500">Areas to Improve</h3>
          <ul className="space-y-2.5">
            {a.weaknesses.map((w, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-300">
                <span className="text-slate-500">·</span> {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="surface mb-8 p-6">
        <h3 className="mb-4 text-xs font-medium uppercase tracking-wide text-ember-400">Improvement Plan</h3>
        <ol className="space-y-3">
          {a.suggestions.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-slate-300">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ember-500/10 font-mono text-[11px] text-ember-300">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="surface p-6">
        <h3 className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-500">Transcript</h3>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-400">{record.transcript}</p>
      </div>
    </div>
  )
}
