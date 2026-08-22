import { useEffect, useRef } from 'react'
import { Pause, Play, Square } from 'lucide-react'
import Waveform from './Waveform'
import { useRecorder } from '../hooks/useRecorder'
import { useTimer } from '../hooks/useTimer'
import type { SpeechDuration } from '../types'
import { playTimerEnd } from '../utils/sound'

interface RecorderPanelProps {
  speechDuration: SpeechDuration
  onFinished: (blob: Blob, durationSeconds: number) => void
  /** If true, recording begins the moment this panel mounts, no extra click needed. */
  autoStart?: boolean
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * Shared recording UI used by the main practice flow, HR Interview, and Debate
 * modes. Wires useRecorder (MediaRecorder) together with useTimer and hands
 * the finished audio blob + duration back to the caller.
 */
export default function RecorderPanel({ speechDuration, onFinished, autoStart = false }: RecorderPanelProps) {
  const recorder = useRecorder()
  const hasAutoStarted = useRef(false)
  const timer = useTimer({
    durationSeconds: speechDuration,
    onComplete: () => {
      playTimerEnd()
      if (recorder.status === 'recording' || recorder.status === 'paused') {
        recorder.stopRecording()
      }
    },
  })

  useEffect(() => {
    if (autoStart && !hasAutoStarted.current) {
      hasAutoStarted.current = true
      recorder.startRecording().then(() => timer.start())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart])

  const handleStart = async () => {
    await recorder.startRecording()
    timer.start()
  }
  const handlePause = () => {
    recorder.pauseRecording()
    timer.pause()
  }
  const handleResume = () => {
    recorder.resumeRecording()
    timer.resume()
  }
  const handleStop = () => {
    recorder.stopRecording()
    timer.stop()
  }

  if (recorder.status === 'stopped' && recorder.audioBlob) {
    onFinished(recorder.audioBlob, timer.secondsElapsed)
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-2">
        {recorder.status === 'recording' && (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember-500/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-ember-500" />
          </span>
        )}
        <span className="font-mono text-2xl font-light text-slate-200">{formatTime(timer.secondsElapsed)}</span>
        {speechDuration > 0 && (
          <span className="text-xs text-slate-600">/ {formatTime(speechDuration)}</span>
        )}
      </div>

      <Waveform data={recorder.waveformData} isActive={recorder.status === 'recording'} />

      {recorder.errorMessage && (
        <p className="max-w-xs text-center text-xs text-rose-400/80">{recorder.errorMessage}</p>
      )}

      <div className="flex items-center gap-3">
        {recorder.status === 'idle' && !autoStart && (
          <button onClick={handleStart} className="btn-primary">
            Start Recording
          </button>
        )}
        {recorder.status === 'recording' && (
          <>
            <button onClick={handlePause} className="btn-secondary !px-4 !py-2">
              <Pause size={14} />
            </button>
            <button onClick={handleStop} className="btn-primary">
              <Square size={12} /> Stop
            </button>
          </>
        )}
        {recorder.status === 'paused' && (
          <>
            <button onClick={handleResume} className="btn-secondary !px-4 !py-2">
              <Play size={14} />
            </button>
            <button onClick={handleStop} className="btn-primary">
              <Square size={12} /> Stop
            </button>
          </>
        )}
        {recorder.status === 'stopped' && (
          <span className="text-xs text-sage-400">Processing your recording…</span>
        )}
      </div>
    </div>
  )
}
