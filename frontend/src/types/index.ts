// Central type definitions shared across the SpeakWise AI frontend.

export type TopicCategory =
  | 'Technology'
  | 'Education'
  | 'Science'
  | 'Business'
  | 'History'
  | 'Psychology'
  | 'Motivation'
  | 'Communication'
  | 'Ethics'
  | 'Debate'

export interface Topic {
  id: string
  category: TopicCategory
  text: string
}

/** The two practice modes, replacing the old prep/speech-duration picker. */
export type PracticeMode = 'off-the-cuff' | 'deep-research'

/** Recording length in seconds; 0 means unlimited. Used directly by RecorderPanel. */
export type SpeechDuration = number

export const PRACTICE_MODE_CONFIG: Record<
  PracticeMode,
  { label: string; description: string; prepSeconds: number; speechSeconds: number }
> = {
  'off-the-cuff': {
    label: 'Off The Cuff',
    description: 'A brief moment to gather your thoughts, then speak spontaneously.',
    prepSeconds: 20,
    speechSeconds: 90,
  },
  'deep-research': {
    label: 'Deep Research',
    description: 'A longer window to think it through before you speak.',
    prepSeconds: 180,
    speechSeconds: 180,
  },
}

export type SessionMode = 'practice' | 'hr' | 'debate'

export interface AIAnalysis {
  overallScore: number
  confidenceScore: number
  fluencyScore: number
  grammarScore: number
  vocabularyScore: number
  structureScore: number
  strengths: string[]
  weaknesses: string[]
  fillerWords: { word: string; count: number }[]
  suggestions: string[]
}

export interface SpeechRecord {
  id: string
  mode: SessionMode
  practiceMode?: PracticeMode
  topic: string
  category?: TopicCategory
  date: string // ISO string
  durationSeconds: number
  transcript: string
  analysis: AIAnalysis | null
}

export interface HRQuestion {
  id: string
  question: string
  tip: string
}

export interface DebatePrompt {
  id: string
  topic: string
  stance: 'for' | 'against'
  argument: string
}
