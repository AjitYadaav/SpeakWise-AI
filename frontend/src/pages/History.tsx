import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Trash2, RotateCcw, Inbox } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { analyzeSpeech } from '../services/api'

export default function History() {
  const { history, deleteRecord, updateRecord } = useApp()
  const [query, setQuery] = useState('')
  const [reanalyzingId, setReanalyzingId] = useState<string | null>(null)
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    if (!query.trim()) return history
    const q = query.toLowerCase()
    return history.filter((r) => r.topic.toLowerCase().includes(q) || r.transcript.toLowerCase().includes(q))
  }, [history, query])

  async function handleReanalyze(id: string) {
    const record = history.find((r) => r.id === id)
    if (!record) return
    setReanalyzingId(id)
    try {
      const analysis = await analyzeSpeech({
        transcript: record.transcript,
        topic: record.topic,
        mode: record.mode,
        durationSeconds: record.durationSeconds,
      })
      updateRecord(id, { analysis })
      navigate(`/results/${id}`)
    } catch {
      alert('Reanalysis failed. Please check your backend connection and try again.')
    } finally {
      setReanalyzingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-28">
      <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-topic text-3xl">Sessions</h1>
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="input-field pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="surface flex flex-col items-center gap-3 p-16 text-center">
          <Inbox size={26} className="text-slate-700" />
          <p className="text-sm text-slate-500">
            {history.length === 0 ? 'No sessions yet.' : 'Nothing matches your search.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((r) => (
            <div key={r.id} className="surface flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <button className="flex-1 text-left" onClick={() => navigate(`/results/${r.id}`)}>
                <p className="font-mono text-[11px] uppercase tracking-wide text-slate-600">
                  {r.category ?? r.mode} · {new Date(r.date).toLocaleDateString()}
                </p>
                <p className="mt-1 font-serif italic text-slate-100">{r.topic}</p>
              </button>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {r.analysis && (
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-sm text-ember-300">
                    {Math.round(r.analysis.overallScore)}
                  </span>
                )}
                <button onClick={() => handleReanalyze(r.id)} disabled={reanalyzingId === r.id} className="btn-ghost !px-2" title="Reanalyze">
                  <RotateCcw size={14} className={reanalyzingId === r.id ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this session?')) deleteRecord(r.id)
                  }}
                  className="btn-ghost !px-2 text-rose-400/80"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
