"use client"
import React, { useState } from 'react'
import { BatchFraudUpload } from '@/components/fraud/batch-fraud-upload'
import { FraudInput, BatchFraudOutput } from '@/lib/types'
import { detectFraudBatch } from '@/lib/api'
import { FileStack } from 'lucide-react'

export default function FraudBatchPage() {
  const [results, setResults] = useState<BatchFraudOutput | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleBatchAnalyze = async (claims: FraudInput[]) => {
    setIsLoading(true)
    setError(null)
    setResults(null)
    
    try {
      const res = await detectFraudBatch(claims)
      setResults(res)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred during batch analysis.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <FileStack className="h-8 w-8 text-indigo-600" />
          Batch Fraud Analysis
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="max-w-5xl">
        <BatchFraudUpload 
          onBatchAnalyze={handleBatchAnalyze} 
          isLoading={isLoading} 
          results={results} 
        />
      </div>
    </div>
  )
}
