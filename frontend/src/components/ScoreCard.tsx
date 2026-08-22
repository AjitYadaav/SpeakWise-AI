interface ScoreCardProps {
  label: string
  score: number // 0-100
}

function scoreColor(score: number): string {
  if (score >= 80) return '#9CC3B2' // sage
  if (score >= 60) return '#D4AF6A' // ember
  if (score >= 40) return '#E0B15C'
  return '#E08585'
}

export default function ScoreCard({ label, score }: ScoreCardProps) {
  const color = scoreColor(score)
  return (
    <div className="surface flex flex-col gap-2 p-5">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <span className="font-serif text-3xl font-light" style={{ color }}>
        {Math.round(score)}
      </span>
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}
