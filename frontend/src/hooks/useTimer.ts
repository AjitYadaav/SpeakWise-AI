import { useCallback, useEffect, useRef, useState } from 'react'

interface UseTimerOptions {
  /** Total duration in seconds. Pass 0 for a count-up (unlimited) timer. */
  durationSeconds: number
  onComplete?: () => void
  autoStart?: boolean
}

interface UseTimerReturn {
  secondsElapsed: number
  secondsRemaining: number
  progressPct: number // 0-100, always 0 for unlimited timers
  isRunning: boolean
  isPaused: boolean
  isComplete: boolean
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  reset: () => void
}

/**
 * A pause/resume-capable timer used for both the preparation countdown and the
 * speech recording clock. When durationSeconds is 0, behaves as an unlimited
 * count-up timer (used for "Unlimited" speech duration mode).
 */
export function useTimer({ durationSeconds, onComplete, autoStart = false }: UseTimerOptions): UseTimerReturn {
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(autoStart)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = window.setInterval(() => {
        setSecondsElapsed((prev) => {
          const next = prev + 1
          if (durationSeconds > 0 && next >= durationSeconds) {
            clearTimer()
            setIsRunning(false)
            onCompleteRef.current?.()
            return durationSeconds
          }
          return next
        })
      }, 1000)
    }
    return clearTimer
  }, [isRunning, isPaused, durationSeconds, clearTimer])

  const start = useCallback(() => {
    setSecondsElapsed(0)
    setIsPaused(false)
    setIsRunning(true)
  }, [])

  const pause = useCallback(() => setIsPaused(true), [])
  const resume = useCallback(() => setIsPaused(false), [])

  const stop = useCallback(() => {
    clearTimer()
    setIsRunning(false)
    setIsPaused(false)
  }, [clearTimer])

  const reset = useCallback(() => {
    clearTimer()
    setIsRunning(false)
    setIsPaused(false)
    setSecondsElapsed(0)
  }, [clearTimer])

  const secondsRemaining = durationSeconds > 0 ? Math.max(0, durationSeconds - secondsElapsed) : 0
  const progressPct = durationSeconds > 0 ? Math.min(100, (secondsElapsed / durationSeconds) * 100) : 0
  const isComplete = durationSeconds > 0 && secondsElapsed >= durationSeconds

  return {
    secondsElapsed,
    secondsRemaining,
    progressPct,
    isRunning,
    isPaused,
    isComplete,
    start,
    pause,
    resume,
    stop,
    reset,
  }
}
