"use client"
import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FraudInput, BatchFraudOutput } from '@/lib/types'
import { Upload, FileType, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'
import { RiskBadge, AlertBadge } from './risk-badge'

interface BatchFraudUploadProps {
  onBatchAnalyze: (claims: FraudInput[]) => void
  isLoading: boolean
  results: BatchFraudOutput | null
}

export function BatchFraudUpload({ onBatchAnalyze, isLoading, results }: BatchFraudUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        
        if (lines.length < 2) {
          throw new Error('File must contain a header row and at least one data row.')
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        const claims: FraudInput[] = []

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
          if (values.length !== headers.length) continue

          const row: any = {}
          headers.forEach((header, index) => {
            const val = values[index]
            // Convert to number if it's purely numeric
            if (!isNaN(Number(val)) && val !== '') {
              row[header] = Number(val)
            } else {
              row[header] = val
            }
          })
          claims.push(row as FraudInput)
        }

        if (claims.length === 0) {
          throw new Error('No valid rows found in the CSV.')
        }
        if (claims.length > 50) {
          throw new Error('Maximum 50 claims allowed per batch analysis.')
        }

        onBatchAnalyze(claims)
      } catch (err: any) {
        setError(err.message || 'Error parsing CSV file.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 shadow-sm rounded-xl bg-white">
        <CardHeader className="border-b bg-white pb-4">
          <CardTitle className="text-lg font-semibold text-slate-800">Batch Fraud Analysis</CardTitle>
          <p className="text-sm text-slate-500">Upload a CSV file containing up to 50 claims to detect potential fraud.</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div 
            className="border-2 border-dashed border-slate-300 rounded-lg p-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 text-slate-400 mb-3" />
            <p className="text-sm font-medium text-slate-700">Click or drag CSV file to upload</p>
            <p className="text-xs text-slate-500 mt-1">Columns must match the FraudInput API schema.</p>
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            {isLoading && (
              <div className="mt-4 flex items-center text-sm font-semibold text-indigo-600">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent mr-2"></div>
                Analyzing {results?.summary?.total_claims || ''} claims...
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {results && (
        <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white animate-in slide-in-from-bottom-4">
          <CardHeader className="border-b bg-slate-50/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-800">Batch Results Summary</CardTitle>
              <div className="flex gap-4 text-sm">
                <span className="font-semibold text-slate-600">Total: {results.summary.total_claims}</span>
                <span className="font-bold text-red-600">Alerts: {results.summary.alerts_raised} ({results.summary.alert_rate}%)</span>
              </div>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">ID / Row</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Risk Level</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Top Factors</th>
                </tr>
              </thead>
              <tbody>
                {results.results.map((res, idx) => (
                  <tr key={idx} className="bg-white border-b hover:bg-slate-50 last:border-0">
                    <td className="px-6 py-4 font-medium text-slate-900">Claim #{idx + 1}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{res.fraud_score}</td>
                    <td className="px-6 py-4"><RiskBadge level={res.risk_level} /></td>
                    <td className="px-6 py-4">
                      {res.alert 
                        ? <span className="flex items-center text-red-600 font-bold gap-1"><AlertTriangle className="h-4 w-4"/> Alert</span>
                        : <span className="flex items-center text-green-600 font-medium gap-1"><CheckCircle2 className="h-4 w-4"/> Clear</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-[200px] truncate">
                      {res.top_risk_factors.map(f => f.replace(/_/g, ' ')).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
