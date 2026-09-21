"use client"
import React from 'react'
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts'

interface FraudGaugeProps {
  score: number // 0 to 100
  riskLevel: 'Low' | 'Medium' | 'High' | 'Very High'
}

export function FraudGauge({ score, riskLevel }: FraudGaugeProps) {
  const getColor = () => {
    switch (riskLevel) {
      case 'Low': return '#22c55e' // green
      case 'Medium': return '#f59e0b' // amber
      case 'High': return '#f97316' // orange
      case 'Very High': return '#ef4444' // red
      default: return '#94a3b8'
    }
  }

  const data = [
    { name: 'score', value: score, fill: getColor() }
  ]

  return (
    <div className="relative h-48 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          cx="50%" 
          cy="75%" 
          innerRadius="70%" 
          outerRadius="100%" 
          barSize={16} 
          data={data} 
          startAngle={180} 
          endAngle={0}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: '#f1f5f9' }}
            dataKey="value"
            cornerRadius={10}
            isAnimationActive={true}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute flex flex-col items-center justify-center" style={{ top: '60%' }}>
        <span className="text-4xl font-black" style={{ color: getColor() }}>{score.toFixed(1)}</span>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Fraud Score</span>
      </div>
    </div>
  )
}
