"use client"
import React, { useState, useEffect } from 'react'
import { FraudForm } from '@/components/fraud/fraud-form'
import { FraudResult } from '@/components/fraud/fraud-result'
import { FraudInput, FraudOutput, FraudModelInfo } from '@/lib/types'
import { detectFraud, getFraudModelInfo } from '@/lib/api'
import { ShieldAlert } from 'lucide-react'

export default function FraudDetectPage() {
  const [result, setResult] = useState<FraudOutput | null>(null)
  const [modelInfo, setModelInfo] = useState<FraudModelInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getFraudModelInfo()
      .then(info => setModelInfo(info))
      .catch(err => console.error('Failed to load fraud model info:', err))
  }, [])

  const handleAnalyze = async (data: FraudInput) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await detectFraud(data)
      setResult(res)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred during analysis.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-indigo-600" />
          Single Claim Fraud Analysis
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <FraudForm onSubmit={handleAnalyze} isLoading={isLoading} />
        </div>
        <div>
          <FraudResult result={result} modelInfo={modelInfo} />
        </div>
      </div>
    </div>
  )
}
