import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import type { AIAnalysis } from '../types'

interface RadarChartPanelProps {
  analysis: AIAnalysis
}

export default function RadarChartPanel({ analysis }: RadarChartPanelProps) {
  const data = [
    { metric: 'Confidence', value: analysis.confidenceScore },
    { metric: 'Fluency', value: analysis.fluencyScore },
    { metric: 'Grammar', value: analysis.grammarScore },
    { metric: 'Vocabulary', value: analysis.vocabularyScore },
    { metric: 'Structure', value: analysis.structureScore },
  ]

  return (
    <div className="surface p-6">
      <h3 className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-500">Skill Breakdown</h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#8A9490', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#4A5551', fontSize: 10 }} />
          <Radar name="Score" dataKey="value" stroke="#D4AF6A" fill="#D4AF6A" fillOpacity={0.25} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
