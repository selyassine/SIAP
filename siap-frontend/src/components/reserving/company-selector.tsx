"use client"
import React, { useEffect, useState } from 'react'
import { getModelInfo } from '@/lib/api'
import { ModelInfoOutput } from '@/lib/types'
import { Select } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface CompanySelectorProps {
  onCompanyChange: (grcode: number) => void;
  selectedGrcode: number | null;
}

export function CompanySelector({ onCompanyChange, selectedGrcode }: CompanySelectorProps) {
  const [modelInfo, setModelInfo] = useState<ModelInfoOutput | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const info = await getModelInfo()
        setModelInfo(info)
        if (info.companies.length > 0 && !selectedGrcode) {
          onCompanyChange(info.companies[0].grcode)
        }
      } catch (err) {
        console.error("Failed to load model info", err)
      } finally {
        setLoading(false)
      }
    }
    fetchInfo()
  }, [])

  if (loading) {
    return <div className="flex items-center text-sm text-slate-500"><Loader2 className="h-4 w-4 mr-2 animate-spin"/> Loading companies...</div>
  }

  if (!modelInfo) return null

  return (
    <div className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm border border-slate-200">
      <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">Select Portfolio:</span>
      <Select 
        value={selectedGrcode?.toString() || ""} 
        onChange={(e) => onCompanyChange(Number(e.target.value))}
        className="w-[300px]"
      >
        {modelInfo.companies.map(c => (
          <option key={c.grcode} value={c.grcode}>
            [{c.grcode}] {c.name} ({c.line_of_business})
          </option>
        ))}
      </Select>
    </div>
  )
}
