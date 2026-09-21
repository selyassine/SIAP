import { CostEstimate } from "@/lib/vision-types";

interface CostEstimateCardProps {
  cost: CostEstimate;
  severity: string;
}

const fmt = (value: number, currency: string) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency || 'EUR',
    maximumFractionDigits: 0,
  }).format(value);

export function CostEstimateCard({ cost, severity }: CostEstimateCardProps) {
  if (severity === 'No Damage Detected') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-emerald-700 font-semibold">Aucun coût estimé</p>
        <p className="text-emerald-600 text-sm mt-1">Aucun dommage détecté sur le véhicule</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 space-y-5">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Coût Estimé de Réparation</p>

        {/* Central estimate — hero */}
        <div className="text-center py-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white mb-4">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-1">Estimation centrale</p>
          <p className="text-4xl font-bold tracking-tight">{fmt(cost.central, cost.currency)}</p>
        </div>

        {/* Min / Max */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Minimum</p>
            <p className="text-xl font-bold text-emerald-800">{fmt(cost.min, cost.currency)}</p>
          </div>
          <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-center">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Maximum</p>
            <p className="text-xl font-bold text-red-800">{fmt(cost.max, cost.currency)}</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center leading-relaxed">
        Estimation basée sur les barèmes actuariels du modèle YOLO.
        <br />Les coûts réels peuvent varier selon le prestataire.
      </p>
    </div>
  );
}
