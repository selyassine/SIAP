'use client'
import { useState } from 'react'
import { FileText, Download, Loader2, CheckCircle2, BarChart3, ShieldAlert, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { generateReport } from '@/lib/api'

const reportSections = [
  { icon: BarChart3, label: 'KPIs portefeuille & tendances Loss/Combined Ratio' },
  { icon: ShieldAlert, label: 'Analyse fraude par type de sinistre' },
  { icon: FileText, label: 'Réserves IBNR & développement Chain Ladder' },
  { icon: Brain, label: '3 commentaires interprétatifs IA (Groq)' },
]

export function GenerateReportCard() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await generateReport()
      setSuccess(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden border-0 shadow-xl shadow-slate-200/50">
      <div className="h-1.5 bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600" />
      <CardHeader className="text-center pb-2 pt-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
          <FileText className="h-8 w-8" />
        </div>
        <CardTitle className="text-xl">Rapport Portefeuille Complet</CardTitle>
        <CardDescription className="max-w-md mx-auto">
          Synthèse exécutive PDF avec graphiques matplotlib et analyses IA
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pb-8">
        <ul className="space-y-3 max-w-sm mx-auto">
          {reportSections.map((section) => (
            <li key={section.label} className="flex items-start gap-3 text-sm text-slate-600">
              <section.icon className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
              {section.label}
            </li>
          ))}
        </ul>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700 flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Rapport téléchargé avec succès
          </div>
        )}

        <div className="text-center">
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={loading}
            className="min-w-[240px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération en cours… (10–20s)
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Générer le Rapport PDF
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            4 graphiques + 3 analyses IA — nécessite GROQ_API_KEY configurée
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
