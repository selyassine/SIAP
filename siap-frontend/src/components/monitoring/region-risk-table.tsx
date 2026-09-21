import { RegionKpiItem } from "@/lib/types";

interface RegionRiskTableProps {
  regions: RegionKpiItem[];
}

export function RegionRiskTable({ regions }: RegionRiskTableProps) {
  const getRiskBadge = (level: string) => {
    const styles: Record<string, string> = {
      "Low": "bg-emerald-50 text-emerald-700 border-emerald-200",
      "Medium": "bg-amber-50 text-amber-700 border-amber-200",
      "High": "bg-orange-50 text-orange-700 border-orange-200",
      "Very High": "bg-red-50 text-red-700 border-red-200",
    };
    return styles[level] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const getRiskDot = (level: string) => {
    const colors: Record<string, string> = {
      "Low": "bg-emerald-500",
      "Medium": "bg-amber-500",
      "High": "bg-orange-500",
      "Very High": "bg-red-500",
    };
    return colors[level] || "bg-slate-500";
  };

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Région</th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Polices</th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Fréquence</th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Sévérité</th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Loss Ratio</th>
              <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Niveau de Risque</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {regions.map((region, index) => (
              <tr 
                key={region.region_code} 
                className={`transition-colors hover:bg-slate-50/80 ${
                  index === 0 ? 'bg-red-50/30' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <span className="font-semibold text-slate-900">{region.region_code}</span>
                </td>
                <td className="px-6 py-4 text-right tabular-nums text-slate-600 font-medium">
                  {region.policies.toLocaleString('fr-FR')}
                </td>
                <td className="px-6 py-4 text-right tabular-nums text-slate-600">
                  {(region.frequency * 100).toFixed(2)}%
                </td>
                <td className="px-6 py-4 text-right tabular-nums text-slate-600">
                  {region.severity.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="tabular-nums font-semibold text-slate-900">
                    {(region.loss_ratio * 100).toFixed(2)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${getRiskBadge(region.risk_level)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getRiskDot(region.risk_level)}`}></span>
                    {region.risk_level}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
