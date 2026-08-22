import { useCallback, useRef, useState } from 'react'
import type { Topic } from '../types'
import { playShuffleTick, playReveal } from '../utils/sound'

interface UseTopicShuffleReturn {
  displayedTopic: Topic | null
  isShuffling: boolean
  shuffle: (pool: Topic[]) => void
}

/**
 * Drives the "slot machine" topic reveal: rapidly swaps the displayed topic
 * for ~2.2 seconds, using a schedule of delays that starts fast and eases out
 * to a stop, then settles on a final topic chosen up front (so the very last
 * flicker IS the real answer, not a jarring swap after it "stops").
 */
export function useTopicShuffle(): UseTopicShuffleReturn {
  const [displayedTopic, setDisplayedTopic] = useState<Topic | null>(null)
  const [isShuffling, setIsShuffling] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  const shuffle = useCallback((pool: Topic[]) => {
    if (pool.length === 0 || isShuffling) return
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)

    setIsShuffling(true)
    const finalTopic = pool[Math.floor(Math.random() * pool.length)]

    // Build an easing schedule of step delays: quick at first, slowing to a stop.
    // ease-out cubic mapped across ~14-18 steps totaling ~2.2-2.6 seconds.
    const stepCount = 16
    const minDelay = 45
    const maxDelay = 260
    const delays: number[] = []
    for (let i = 0; i < stepCount; i++) {
      const t = i / (stepCount - 1)
      const eased = 1 - Math.pow(1 - t, 3) // cubic ease-out
      delays.push(Math.round(minDelay + eased * (maxDelay - minDelay)))
    }

    let step = 0
    const tick = () => {
      if (step >= delays.length) {
        setDisplayedTopic(finalTopic)
        setIsShuffling(false)
        playReveal()
        return
      }
      const isLast = step === delays.length - 1
      const candidate = isLast ? finalTopic : pool[Math.floor(Math.random() * pool.length)]
      setDisplayedTopic(candidate)
      playShuffleTick(1 - step / delays.length)
      timeoutRef.current = window.setTimeout(tick, delays[step])
      step++
    }
    tick()
  }, [isShuffling])

  return { displayedTopic, isShuffling, shuffle }
}
