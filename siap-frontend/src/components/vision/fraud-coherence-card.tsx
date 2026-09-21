import { AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";
import { FraudCoherenceOutput } from "@/lib/vision-types";

interface FraudCoherenceCardProps {
  coherence: FraudCoherenceOutput;
}

const RECOMMENDATION_CONFIG = {
  AUTO_APPROVE: {
    color: "bg-emerald-50 border-emerald-200 text-emerald-800",
    iconColor: "text-emerald-500",
    Icon: CheckCircle,
    label: "Auto-Approuvé",
    description: "La déclaration est cohérente avec l'analyse visuelle",
  },
  MANUAL_REVIEW: {
    color: "bg-amber-50 border-amber-200 text-amber-800",
    iconColor: "text-amber-500",
    Icon: AlertTriangle,
    label: "Révision Manuelle",
    description: "Incohérences modérées détectées",
  },
  INVESTIGATION_REQUIRED: {
    color: "bg-red-50 border-red-200 text-red-800",
    iconColor: "text-red-500",
    Icon: ShieldAlert,
    label: "Investigation Requise",
    description: "Incohérences majeures. Suspicion de fraude",
  },
};

export function FraudCoherenceCard({ coherence }: FraudCoherenceCardProps) {
  const config = RECOMMENDATION_CONFIG[coherence.recommendation];
  const Icon = config.Icon;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Analyse de Cohérence</h3>
        <p className="text-sm text-slate-500 mt-1">
          Croisement des données visuelles et déclaratives
        </p>
      </div>

      {/* Score Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">Score d'incohérence</span>
          <span className="text-sm font-bold text-slate-900">{coherence.incoherence_score.toFixed(0)}/100</span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              coherence.incoherence_score >= 60
                ? "bg-red-500"
                : coherence.incoherence_score >= 30
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
            style={{ width: `${Math.max(0, Math.min(100, coherence.incoherence_score))}%` }}
          />
        </div>
      </div>

      {/* Recommendation Banner */}
      <div className={`rounded-xl border p-4 ${config.color} ${coherence.fraud_flag ? "animate-pulse" : ""}`}>
        <div className="flex items-start gap-3">
          <Icon className={`w-6 h-6 mt-0.5 shrink-0 ${config.iconColor}`} />
          <div>
            <p className="font-bold tracking-wide">{config.label}</p>
            <p className="text-sm opacity-90 mt-0.5">{config.description}</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {coherence.alerts.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alertes Détectées</p>
          <div className="space-y-2">
            {coherence.alerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-100">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span>{alert}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {coherence.alerts.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg p-3 border border-emerald-100">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Aucune alerte détectée. Déclaration parfaitement cohérente.</span>
        </div>
      )}
    </div>
  );
}
