import { useCallback, useEffect, useRef, useState } from 'react'

export type RecorderStatus = 'idle' | 'recording' | 'paused' | 'stopped' | 'error'

interface UseRecorderReturn {
  status: RecorderStatus
  audioBlob: Blob | null
  audioUrl: string | null
  waveformData: number[] // rolling amplitude samples for visualization, 0-1 range
  errorMessage: string | null
  startRecording: () => Promise<void>
  pauseRecording: () => void
  resumeRecording: () => void
  stopRecording: () => void
  resetRecording: () => void
}

const WAVEFORM_SAMPLE_COUNT = 64

/**
 * Wraps the browser MediaRecorder API to capture microphone audio, exposing
 * start/pause/resume/stop controls plus a live amplitude array for a waveform
 * visualization driven by the Web Audio API's AnalyserNode.
 */
export function useRecorder(): UseRecorderReturn {
  const [status, setStatus] = useState<RecorderStatus>('idle')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [waveformData, setWaveformData] = useState<number[]>(new Array(WAVEFORM_SAMPLE_COUNT).fill(0.05))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)

  const tickWaveform = useCallback(() => {
    const analyser = analyserRef.current
    if (!analyser) return
    const bufferLength = analyser.fftSize
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteTimeDomainData(dataArray)

    // Downsample the raw waveform buffer into WAVEFORM_SAMPLE_COUNT bars.
    const step = Math.floor(bufferLength / WAVEFORM_SAMPLE_COUNT)
    const samples: number[] = []
    for (let i = 0; i < WAVEFORM_SAMPLE_COUNT; i++) {
      const idx = i * step
      const value = Math.abs(dataArray[idx] - 128) / 128 // 0-1 amplitude
      samples.push(Math.max(0.05, value))
    }
    setWaveformData(samples)
    rafRef.current = requestAnimationFrame(tickWaveform)
  }, [])

  const cleanupAudioGraph = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    analyserRef.current = null
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
  }, [])

  const startRecording = useCallback(async () => {
    setErrorMessage(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []

      // Set up the analyser for the waveform visualization.
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      rafRef.current = requestAnimationFrame(tickWaveform)

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      const recorder = new MediaRecorder(stream, { mimeType })
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        streamRef.current?.getTracks().forEach((t) => t.stop())
        cleanupAudioGraph()
      }
      recorder.start(250)
      mediaRecorderRef.current = recorder
      setStatus('recording')
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? `Microphone access failed: ${err.message}`
          : 'Microphone access failed. Please check your browser permissions.',
      )
      setStatus('error')
    }
  }, [tickWaveform, cleanupAudioGraph])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause()
      setStatus('paused')
    }
  }, [])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume()
      setStatus('recording')
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setStatus('stopped')
    }
  }, [])

  const resetRecording = useCallback(() => {
    setAudioBlob(null)
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setStatus('idle')
    setWaveformData(new Array(WAVEFORM_SAMPLE_COUNT).fill(0.05))
    chunksRef.current = []
  }, [])

  useEffect(() => {
    return () => {
      cleanupAudioGraph()
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    status,
    audioBlob,
    audioUrl,
    waveformData,
    errorMessage,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
  }
}
