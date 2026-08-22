import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { SpeechRecord } from '../types'
import {
  addSpeechRecord,
  deleteSpeechRecord as deleteSpeechRecordStorage,
  loadHistory,
  updateSpeechRecord as updateSpeechRecordStorage,
} from '../utils/storage'

interface AppContextValue {
  history: SpeechRecord[]
  completeSpeech: (record: Omit<SpeechRecord, 'id'>) => SpeechRecord
  deleteRecord: (id: string) => void
  updateRecord: (id: string, patch: Partial<SpeechRecord>) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<SpeechRecord[]>([])

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  const completeSpeech = useCallback((partial: Omit<SpeechRecord, 'id'>): SpeechRecord => {
    const record: SpeechRecord = { ...partial, id: crypto.randomUUID() }
    setHistory(addSpeechRecord(record))
    return record
  }, [])

  const deleteRecord = useCallback((id: string) => {
    setHistory(deleteSpeechRecordStorage(id))
  }, [])

  const updateRecord = useCallback((id: string, patch: Partial<SpeechRecord>) => {
    setHistory(updateSpeechRecordStorage(id, patch))
  }, [])

  return (
    <AppContext.Provider value={{ history, completeSpeech, deleteRecord, updateRecord }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within an AppProvider')
  return ctx
}
