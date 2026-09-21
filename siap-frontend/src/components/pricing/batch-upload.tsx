"use client"
import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UploadCloud, FileText, Loader2, Download } from 'lucide-react'
import { predictBatch } from '@/lib/api'
import { BatchPricingOutput, PricingInput } from '@/lib/types'

export function BatchUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<BatchPricingOutput | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResults(null)
      setError(null)
    }
  }

  const parseCSV = async (file: File): Promise<PricingInput[]> => {
    const text = await file.text()
    const lines = text.split('\\n').filter(l => l.trim().length > 0)
    if (lines.length < 2) throw new Error("CSV is empty or missing headers")
    
    const headers = lines[0].split(',').map(h => h.trim())
    const requiredHeaders = ['veh_power', 'veh_age', 'driv_age', 'bonus_malus', 'density', 'area', 'veh_brand', 'veh_gas', 'region', 'exposure']
    
    for (const req of requiredHeaders) {
      if (!headers.includes(req)) {
        throw new Error(`Missing required header: ${req}`)
      }
    }

    const policies: PricingInput[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const row: any = {}
      headers.forEach((h, idx) => {
        const val = values[idx]
        if (['veh_power', 'veh_age', 'driv_age', 'bonus_malus', 'density', 'exposure'].includes(h)) {
          row[h] = Number(val)
        } else {
          row[h] = val
        }
      })
      policies.push(row as PricingInput)
    }
    return policies
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const policies = await parseCSV(file)
      if (policies.length > 100) {
        throw new Error("Maximum 100 policies allowed per batch")
      }
      const data = await predictBatch(policies)
      setResults(data)
    } catch (err: any) {
      setError(err.message || err.response?.data?.detail || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <UploadCloud className="h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">Upload Policy Portfolio</h3>
          <p className="text-sm text-slate-500 mt-2 text-center max-w-md">
            Upload a CSV file containing policy data to process batch pricing. Maximum 100 rows per batch.
          </p>
          
          <div className="mt-8 flex items-center gap-4">
            <input
              type="file"
              accept=".csv"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload">
              <Button variant="outline" asChild className="cursor-pointer">
                <span>Select File</span>
              </Button>
            </label>
            <Button onClick={handleUpload} disabled={!file || loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : "Process Batch"}
            </Button>
          </div>
          {file && <p className="mt-4 text-sm font-medium text-teal-600 flex items-center"><FileText className="h-4 w-4 mr-2"/> {file.name}</p>}
          {error && <p className="mt-4 text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <span className="text-sm font-medium text-slate-500">Total Pure Premium</span>
                <span className="text-3xl font-bold text-slate-900 mt-2">€{results.summary.total_pure_premium.toLocaleString('fr-FR')}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <span className="text-sm font-medium text-slate-500">Average Premium</span>
                <span className="text-3xl font-bold text-slate-900 mt-2">€{results.summary.avg_pure_premium.toLocaleString('fr-FR')}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <span className="text-sm font-medium text-slate-500">Policies Processed</span>
                <span className="text-3xl font-bold text-slate-900 mt-2">{results.summary.count}</span>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Pure Premium</th>
                    <th className="px-4 py-3 font-medium">Commercial</th>
                    <th className="px-4 py-3 font-medium">Risk Level</th>
                    <th className="px-4 py-3 font-medium">Frequency</th>
                    <th className="px-4 py-3 font-medium">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.results.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">€{r.pure_premium.toFixed(2)}</td>
                      <td className="px-4 py-3 font-medium text-teal-700">€{r.commercial_premium.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          r.risk_level === 'Low' ? 'bg-green-100 text-green-700' :
                          r.risk_level === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          r.risk_level === 'High' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {r.risk_level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{(r.frequency * 100).toFixed(2)}%</td>
                      <td className="px-4 py-3 text-slate-600">€{r.severity.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
