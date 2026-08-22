import type { PracticeMode } from '../types'
import { PRACTICE_MODE_CONFIG } from '../types'

interface ModeToggleProps {
  mode: PracticeMode
  onChange: (mode: PracticeMode) => void
}

const MODES: PracticeMode[] = ['off-the-cuff', 'deep-research']

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/[0.02] p-1">
      {MODES.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
            mode === m ? 'bg-white/[0.08] text-ember-300' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {PRACTICE_MODE_CONFIG[m].label}
        </button>
      ))}
    </div>
  )
}
