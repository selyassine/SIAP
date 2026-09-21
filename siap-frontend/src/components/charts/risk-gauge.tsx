"use client"
import React from 'react'

export function RiskGauge({ level }: { level: string }) {
  const rotation = {
    'Low': -90,
    'Medium': -30,
    'High': 30,
    'Very High': 90
  }[level] || -90

  return (
    <div className="relative flex flex-col items-center justify-center py-4">
      <svg width="200" height="110" viewBox="0 0 200 110">
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#E2E8F0" strokeWidth="20" />
        {/* Color segments */}
        <path d="M 20 100 A 80 80 0 0 1 50 40" fill="none" stroke="#22C55E" strokeWidth="20" />
        <path d="M 50 40 A 80 80 0 0 1 100 20" fill="none" stroke="#F59E0B" strokeWidth="20" />
        <path d="M 100 20 A 80 80 0 0 1 150 40" fill="none" stroke="#F97316" strokeWidth="20" />
        <path d="M 150 40 A 80 80 0 0 1 180 100" fill="none" stroke="#EF4444" strokeWidth="20" />
        
        {/* Needle */}
        <g transform={`translate(100, 100) rotate(${rotation})`}>
          <polygon points="-5,-5 5,-5 0,-70" fill="#0F172A" />
          <circle cx="0" cy="0" r="8" fill="#0F172A" />
        </g>
      </svg>
      <div className="mt-2 text-xl font-bold text-slate-900">{level} Risk</div>
    </div>
  )
}
