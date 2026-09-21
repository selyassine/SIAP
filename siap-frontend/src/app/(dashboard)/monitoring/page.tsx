"use client";

import { useEffect, useState } from "react";
import { getDashboardSummary } from "@/lib/api";
import { KpiCard } from "@/components/monitoring/kpi-card";
import { SourceBadge } from "@/components/monitoring/source-badge";
import { LossRatioChart } from "@/components/monitoring/loss-ratio-chart";
import { RegionRiskTable } from "@/components/monitoring/region-risk-table";
import { FraudBreakdownChart } from "@/components/monitoring/fraud-breakdown-chart";
import { FraudTrendsChart } from "@/components/monitoring/fraud-trends-chart";
import { ReservesStackedChart } from "@/components/monitoring/reserves-stacked-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, MapPin, ShieldAlert, Landmark, TrendingUp, Users, DollarSign, Percent } from "lucide-react";

export default function MonitoringPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDashboardSummary();
        setData(result);
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-teal-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-t-2 border-indigo-400 animate-spin opacity-50" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-red-500 font-medium">
        {error}
      </div>
    );
  }

  const { global_kpis, fraud_stats, reserves_summary, top_risky_regions, latest_yearly_trend } = data;

  return (
    <div className="space-y-8 pb-10 relative">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-teal-50/40 to-transparent -z-10 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-teal-400/5 blur-[110px] -z-10 pointer-events-none" />

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analyses de Risque (Risk Analytics)</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Supervision globale du portefeuille, détection de fraude et réserves IBNR.
          </p>
        </div>
      </div>

        {/* ── Tabs Navigation ── */}
        <Tabs defaultValue="global" className="w-full">
          <TabsList className="inline-flex bg-white border border-slate-200 p-1.5 rounded-xl shadow-sm">
            <TabsTrigger value="global" className="gap-2">
              <TrendingUp className="w-4 h-4" /> Vue globale
            </TabsTrigger>
            <TabsTrigger value="regions" className="gap-2">
              <MapPin className="w-4 h-4" /> Régions
            </TabsTrigger>
            <TabsTrigger value="fraud" className="gap-2">
              <ShieldAlert className="w-4 h-4" /> Fraude
            </TabsTrigger>
            <TabsTrigger value="reserves" className="gap-2">
              <Landmark className="w-4 h-4" /> Réserves
            </TabsTrigger>
          </TabsList>

          {/* ══════════════ TAB 1 : VUE GLOBALE ══════════════ */}
          <TabsContent value="global" className="mt-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">Performance du Portefeuille</h2>
              <SourceBadge source="freMTPL2 — 678 013 polices auto françaises" />
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <KpiCard
                title="Loss Ratio"
                value={`${(global_kpis.kpis.loss_ratio * 100).toFixed(2)}%`}
                benchmark={`vs marché ${(global_kpis.benchmarks.loss_ratio_market * 100).toFixed(0)}%`}
                delta={`▼ ${((global_kpis.benchmarks.loss_ratio_market - global_kpis.kpis.loss_ratio) * 100).toFixed(1)}pp`}
                deltaPositive={true}
                icon={<Percent className="w-5 h-5" />}
              />
              <KpiCard
                title="Fréquence"
                value={`${(global_kpis.kpis.frequency * 100).toFixed(2)}%`}
                benchmark={`vs marché ${(global_kpis.benchmarks.frequency_market * 100).toFixed(0)}%`}
                delta={`▲ ${((global_kpis.kpis.frequency - global_kpis.benchmarks.frequency_market) * 100).toFixed(1)}pp`}
                deltaPositive={false}
                icon={<Activity className="w-5 h-5" />}
              />
              <KpiCard
                title="Sévérité"
                value={`${global_kpis.kpis.severity.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`}
                benchmark={`vs marché ${global_kpis.benchmarks.severity_market.toLocaleString('fr-FR')} €`}
                delta={`▼ ${(global_kpis.benchmarks.severity_market - global_kpis.kpis.severity).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`}
                deltaPositive={true}
                icon={<DollarSign className="w-5 h-5" />}
              />
              <KpiCard
                title="Combined Ratio"
                value={`${(global_kpis.kpis.combined_ratio * 100).toFixed(2)}%`}
                benchmark={`vs marché ${(global_kpis.benchmarks.combined_ratio_market * 100).toFixed(0)}%`}
                delta={`▼ ${((global_kpis.benchmarks.combined_ratio_market - global_kpis.kpis.combined_ratio) * 100).toFixed(1)}pp`}
                deltaPositive={true}
                icon={<TrendingUp className="w-5 h-5" />}
              />
            </div>

            {/* Chart + Portfolio Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LossRatioChart data={latest_yearly_trend} />
              </div>
              <div className="flex flex-col gap-5">
                {/* Hero metric card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white flex-1">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -translate-y-10 translate-x-10 blur-2xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-4 h-4 text-teal-400" />
                      <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Total Polices</p>
                    </div>
                    <h3 className="text-4xl font-bold tracking-tight">{global_kpis.portfolio.total_policies.toLocaleString('fr-FR')}</h3>
                    <p className="text-slate-400 text-sm mt-2">polices actives dans le portefeuille</p>
                  </div>
                </div>
                
                {/* Secondary metrics */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                      <p className="text-sm font-medium text-slate-500">Total Primes Estimées</p>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 tabular-nums">{global_kpis.portfolio.total_premium.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</h4>
                  </div>
                  <div className="h-px bg-slate-100"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <p className="text-sm font-medium text-slate-500">Total Sinistres Payés</p>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 tabular-nums">{global_kpis.portfolio.total_claim_amount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</h4>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ══════════════ TAB 2 : RÉGIONS ══════════════ */}
          <TabsContent value="regions" className="mt-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">Analyse par Région</h2>
              <SourceBadge source="freMTPL2 — 22 régions françaises" />
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900">Top Régions à Risque</h3>
                <p className="text-sm text-slate-500 mt-1">Les 5 régions avec le plus fort Loss Ratio du portefeuille</p>
              </div>
              <RegionRiskTable regions={top_risky_regions} />
            </div>
          </TabsContent>

          {/* ══════════════ TAB 3 : FRAUDE ══════════════ */}
          <TabsContent value="fraud" className="mt-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">Détection de Fraude</h2>
              <SourceBadge source="Kaggle Insurance Claims — 1 000 sinistres US" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <KpiCard
                title="Taux de Fraude"
                value={`${fraud_stats.global_stats.fraud_rate_pct.toFixed(2)}%`}
                icon={<ShieldAlert className="w-5 h-5" />}
              />
              <KpiCard
                title="Montant Moyen (Fraude)"
                value={`${fraud_stats.global_stats.avg_fraud_amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}`}
              />
              <KpiCard
                title="Montant Moyen (Légitime)"
                value={`${fraud_stats.global_stats.avg_legit_amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}`}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FraudBreakdownChart 
                title="Fraude par Type d'Incident" 
                description="Répartition du taux de fraude selon le type d'incident"
                data={fraud_stats.by_incident_type} 
                dataKeyName="incident_type" 
                dataKeyValue="fraud_rate_pct" 
              />
              <FraudBreakdownChart 
                title="Fraude par Sévérité" 
                description="Répartition du taux de fraude selon la gravité"
                data={fraud_stats.by_severity} 
                dataKeyName="incident_severity" 
                dataKeyValue="fraud_rate_pct" 
                hasHighMajorDamageNote={true}
              />
            </div>

            <FraudTrendsChart data={data.quarterly_trend || []} globalFraudRate={fraud_stats.global_stats.fraud_rate_pct} />
          </TabsContent>

          {/* ══════════════ TAB 4 : RÉSERVES ══════════════ */}
          <TabsContent value="reserves" className="mt-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">Réserves IBNR (Méthode Chain Ladder)</h2>
              <SourceBadge source="CAS Loss Reserve Database — NJ Manufacturers Grp" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <KpiCard
                title="Total IBNR"
                value={`${reserves_summary.total_ibnr.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}`}
                icon={<Landmark className="w-5 h-5" />}
              />
              <KpiCard
                title="Total Primes CAS"
                value={`${reserves_summary.total_premium_cas.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}`}
              />
              <KpiCard
                title="Ratio IBNR / Primes"
                value={`${(reserves_summary.ibnr_to_premium_ratio * 100).toFixed(2)}%`}
                icon={<Percent className="w-5 h-5" />}
              />
            </div>

            {data.reserves_by_year && (
              <ReservesStackedChart data={data.reserves_by_year} />
            )}
          </TabsContent>
        </Tabs>
      </div>
  );
}
