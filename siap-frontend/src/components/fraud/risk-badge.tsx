"use client"
import React from 'react'
import { ShieldAlert, ShieldCheck } from 'lucide-react'

interface RiskBadgeProps {
  level: 'Low' | 'Medium' | 'High' | 'Very High'
  className?: string
}

export function RiskBadge({ level, className = '' }: RiskBadgeProps) {
  const getStyles = () => {
    switch (level) {
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Very High':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyles()} ${className}`}>
      {level} Risk
    </span>
  )
}

export function AlertBadge({ isAlert, className = '' }: { isAlert: boolean, className?: string }) {
  if (isAlert) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-600 text-white font-bold text-sm shadow-sm animate-in fade-in ${className}`}>
        <ShieldAlert className="h-4 w-4" />
        FRAUD ALERT
      </div>
    )
  }
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-green-500 text-white font-bold text-sm shadow-sm ${className}`}>
      <ShieldCheck className="h-4 w-4" />
      CLEAR
    </div>
  )
}
