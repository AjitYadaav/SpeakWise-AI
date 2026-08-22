interface WaveformProps {
  data: number[] // amplitude samples, 0-1
  isActive: boolean
  color?: string
}

export default function Waveform({ data, isActive, color = '#D4AF6A' }: WaveformProps) {
  return (
    <div className="flex h-14 w-full max-w-sm items-center justify-center gap-[3px]">
      {data.map((amplitude, i) => (
        <div
          key={i}
          className="w-[2px] rounded-full transition-all duration-100"
          style={{
            height: `${Math.max(8, amplitude * 100)}%`,
            backgroundColor: isActive ? color : 'rgba(255,255,255,0.12)',
            opacity: isActive ? 0.85 : 0.35,
          }}
        />
      ))}
    </div>
  )
}
