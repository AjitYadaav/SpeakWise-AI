// Thin wrapper around localStorage for the MVP persistence layer.
// Swap this module out for a real backend/database call later without touching call sites.
import type { SpeechRecord } from '../types'

const KEYS = {
  history: 'speakwise.history.v2',
} as const

export function loadHistory(): SpeechRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.history)
    return raw ? (JSON.parse(raw) as SpeechRecord[]) : []
  } catch {
    return []
  }
}

export function saveHistory(history: SpeechRecord[]): void {
  localStorage.setItem(KEYS.history, JSON.stringify(history))
}

export function addSpeechRecord(record: SpeechRecord): SpeechRecord[] {
  const history = [record, ...loadHistory()]
  saveHistory(history)
  return history
}

export function deleteSpeechRecord(id: string): SpeechRecord[] {
  const history = loadHistory().filter((r) => r.id !== id)
  saveHistory(history)
  return history
}

export function updateSpeechRecord(id: string, patch: Partial<SpeechRecord>): SpeechRecord[] {
  const history = loadHistory().map((r) => (r.id === id ? { ...r, ...patch } : r))
  saveHistory(history)
  return history
}
