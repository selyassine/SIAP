import { VisionAnalysisOutput } from "@/lib/vision-types";
import { SeverityBadge } from "./severity-badge";

interface DamageResultProps {
  result: VisionAnalysisOutput;
}

export function DamageResult({ result }: DamageResultProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Annotated image */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Image analysée</h3>
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center">
          <img
            src={`data:image/jpeg;base64,${result.annotated_image_b64}`}
            alt="Véhicule analysé avec bounding boxes"
            className="w-full h-full object-contain"
          />
        </div>
        <p className="text-xs text-slate-400 text-center">
          Les zones colorées indiquent les dommages détectés
        </p>
      </div>

      {/* Evaluation report */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Rapport d'évaluation</h3>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 space-y-5 h-full">
          {/* Severity */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Sévérité globale</span>
            <SeverityBadge severity={result.overall_severity} size="lg" />
          </div>
          <div className="h-px bg-slate-100" />

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Zones détectées</p>
              <p className="text-3xl font-bold text-slate-900">{result.n_damage_zones}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Confiance moy.</p>
              <p className="text-3xl font-bold text-slate-900">
                {result.confidence_avg > 0 ? `${(result.confidence_avg * 100).toFixed(0)}%` : '—'}
              </p>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Detections list */}
          {result.detections.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Zones identifiées</p>
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                {result.detections.map((d, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <span className="text-sm font-medium text-slate-700 truncate">{d.class_name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <SeverityBadge severity={d.severity} size="sm" />
                      <span className="text-xs font-mono text-slate-400 w-10 text-right">
                        {(d.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-slate-400">Aucun dommage détecté</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
