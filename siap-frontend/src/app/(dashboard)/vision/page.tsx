"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { DamageUpload } from "@/components/vision/damage-upload";
import { DamageResult } from "@/components/vision/damage-result";
import { CostEstimateCard } from "@/components/vision/cost-estimate-card";
import { FraudCoherenceCard } from "@/components/vision/fraud-coherence-card";
import { analyzeVehicleDamage } from "@/lib/vision-api";
import { VisionWithFraudOutput, DeclaredSeverity } from "@/lib/vision-types";

export default function VisionPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VisionWithFraudOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (file: File, severity: DeclaredSeverity, amount: number) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await analyzeVehicleDamage(file, severity, amount);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'analyse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/20">
                <Camera className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Damage Assessment</h1>
            </div>
            <p className="text-slate-500 text-sm ml-[52px]">
              Analysez les dommages d'un véhicule depuis une photo et croisez avec la déclaration.
            </p>
          </div>
        </div>

        {/* Input Area */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <DamageUpload onAnalyze={handleAnalyze} isLoading={loading} />
          
          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <p className="font-semibold">Erreur</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}
        </div>

        {/* Results Area */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-10">Résultats de l'Analyse</h2>
            
            {/* Visual Analysis */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <DamageResult result={result.visual_analysis} />
            </div>

            {/* Fraud & Cost */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FraudCoherenceCard coherence={result.fraud_coherence} />
              <CostEstimateCard 
                cost={result.visual_analysis.cost_estimate} 
                severity={result.visual_analysis.overall_severity}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
