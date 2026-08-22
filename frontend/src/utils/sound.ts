// All sound effects for SpeakWise AI are synthesized in-browser with the Web
// Audio API — no MP3/WAV assets. Every function builds a small oscillator/gain
// graph, schedules an envelope, and lets the nodes garbage-collect themselves
// once they've finished playing.

let ctx: AudioContext | null = null

/** Lazily creates (and resumes) a single shared AudioContext. Must be called from a user gesture the first time. */
function getContext(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext
    ctx = new AC()
  }
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
  return ctx
}

interface ToneOptions {
  frequency: number
  duration: number
  type?: OscillatorType
  startTime?: number
  gain?: number
  attack?: number
  release?: number
  filterFreq?: number
}

/** Plays a single soft tone with an attack/release envelope and a gentle lowpass filter for warmth. */
function playTone({
  frequency,
  duration,
  type = 'sine',
  startTime = 0,
  gain = 0.18,
  attack = 0.01,
  release = 0.18,
  filterFreq = 2200,
}: ToneOptions) {
  const audioCtx = getContext()
  const now = audioCtx.currentTime + startTime

  const osc = audioCtx.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, now)

  const filter = audioCtx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(filterFreq, now)

  const gainNode = audioCtx.createGain()
  gainNode.gain.setValueAtTime(0, now)
  gainNode.gain.linearRampToValueAtTime(gain, now + attack)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + attack + duration + release)

  osc.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(audioCtx.destination)

  osc.start(now)
  osc.stop(now + attack + duration + release + 0.05)
}

/** A quiet, dry click played the instant "Generate Topic" is pressed — before the shuffle begins. */
export function playClick() {
  const audioCtx = getContext()
  const now = audioCtx.currentTime

  const osc = audioCtx.createOscillator()
  osc.type = 'square'
  osc.frequency.setValueAtTime(1000, now)

  const gainNode = audioCtx.createGain()
  gainNode.gain.setValueAtTime(0, now)
  gainNode.gain.linearRampToValueAtTime(0.05, now + 0.002)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.035)

  osc.connect(gainNode)
  gainNode.connect(audioCtx.destination)
  osc.start(now)
  osc.stop(now + 0.04)
}

/**
 * A single soft percussive "tick" — used once per cycle while the topic
 * generator is rapidly shuffling through candidate topics. Short, dry, and
 * pitched slightly differently each call so a rapid sequence doesn't feel
 * robotic.
 */
export function playShuffleTick(intensity = 1) {
  const audioCtx = getContext()
  const now = audioCtx.currentTime

  const osc = audioCtx.createOscillator()
  osc.type = 'triangle'
  const baseFreq = 720 + Math.random() * 140
  osc.frequency.setValueAtTime(baseFreq, now)
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, now + 0.05)

  const gainNode = audioCtx.createGain()
  const peak = 0.05 + 0.05 * intensity
  gainNode.gain.setValueAtTime(0, now)
  gainNode.gain.linearRampToValueAtTime(peak, now + 0.004)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.09)

  osc.connect(gainNode)
  gainNode.connect(audioCtx.destination)
  osc.start(now)
  osc.stop(now + 0.1)
}

/**
 * Soft ascending chime played when the topic generator settles on its final
 * topic — three sine tones arranged as a gentle major-ish arpeggio with a
 * long, warm release.
 */
export function playReveal() {
  const notes = [523.25, 659.25, 783.99] // C5, E5, G5 — a calm, resolved chord
  notes.forEach((freq, i) => {
    playTone({
      frequency: freq,
      duration: 0.28,
      type: 'sine',
      startTime: i * 0.05,
      gain: 0.14,
      attack: 0.02,
      release: 0.9,
      filterFreq: 3200,
    })
  })
}

/** Single gentle rising tone that plays when a timer (prep or speaking) begins. */
export function playTimerStart() {
  const audioCtx = getContext()
  const now = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(392, now) // G4
  osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.22) // D5

  const gainNode = audioCtx.createGain()
  gainNode.gain.setValueAtTime(0, now)
  gainNode.gain.linearRampToValueAtTime(0.15, now + 0.03)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.4)

  osc.connect(gainNode)
  gainNode.connect(audioCtx.destination)
  osc.start(now)
  osc.stop(now + 0.45)
}

/** Two soft descending bell-like tones — a calm "time's up" signal, not jarring. */
export function playTimerEnd() {
  playTone({ frequency: 587.33, duration: 0.3, type: 'sine', gain: 0.16, attack: 0.01, release: 0.5, filterFreq: 2800 })
  playTone({ frequency: 440, duration: 0.3, type: 'sine', gain: 0.16, attack: 0.01, release: 0.7, startTime: 0.22, filterFreq: 2800 })
}

/** Unlocks the AudioContext on first user gesture (some browsers require this before any sound will play). */
export function primeAudio() {
  getContext()
}
