import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import type { TopicCategory } from '../types'

interface CategorySelectProps {
  value: TopicCategory | 'all'
  options: TopicCategory[]
  onChange: (value: TopicCategory | 'all') => void
}

/**
 * A fully custom dropdown for category selection. Native <select> elements
 * hand their option list rendering to the OS/browser — on most platforms that
 * means a plain white popup with blue highlights that can't be restyled with
 * CSS, which breaks a dark theme. This component reimplements the same
 * behavior (click to open, click an option or click outside to close,
 * keyboard-dismissible) entirely in themed markup we control.
 */
export default function CategorySelect({ value, options, onChange }: CategorySelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function select(option: TopicCategory | 'all') {
    onChange(option)
    setOpen(false)
  }

  const label = value === 'all' ? 'Any category' : value

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`select-field flex items-center gap-2 ${open ? 'border-ember-500/50' : ''}`}
      >
        {label}
        <ChevronDown
          size={14}
          className={`text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-1/2 top-[calc(100%+8px)] z-30 max-h-80 w-56 -translate-x-1/2 overflow-y-auto rounded-2xl border border-white/10 bg-ink-800/95 p-1.5 shadow-glass backdrop-blur-xl"
          >
            <Option label="Any category" isSelected={value === 'all'} onSelect={() => select('all')} />
            {options.map((opt) => (
              <Option key={opt} label={opt} isSelected={value === opt} onSelect={() => select(opt)} />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

function Option({ label, isSelected, onSelect }: { label: string; isSelected: boolean; onSelect: () => void }) {
  return (
    <li
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      className={`flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
        isSelected ? 'bg-ember-500/10 text-ember-300' : 'text-slate-300 hover:bg-white/[0.06] hover:text-slate-100'
      }`}
    >
      {label}
      {isSelected && <Check size={14} />}
    </li>
  )
}
