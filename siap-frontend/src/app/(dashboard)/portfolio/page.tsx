'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { getDashboardSummary } from '@/lib/api'
import { Users, FileText, Activity, AlertTriangle, ShieldAlert, Euro, TrendingUp, ShieldCheck } from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area, Cell, PieChart, Pie, Legend
} from 'recharts'
import { cn } from '@/lib/utils'
import { MetricCard } from '@/components/ui/metric-card'

export default function PortfolioManagerPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDashboardSummary()
      .then(setData)
      .catch((err) => {
        console.error(err)
        setError("Erreur lors du chargement des données du portfolio.")
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-t-2 border-teal-400 animate-spin opacity-50" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
    </div>
  )
  if (error) return <div className="p-8 text-center text-red-500 font-medium">{error}</div>
  if (!data) return null

  const kpis = data.global_kpis
  const fraud = data.fraud_stats
  const reserves = data.reserves_summary
  const regions = data.top_risky_regions
  const trends = data.quarterly_trend

  const formatEuro = (val: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)

  return (
    <div className="space-y-8 pb-10 relative">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-teal-50/50 to-transparent -z-10 pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-400/5 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-400/5 blur-[100px] -z-10 pointer-events-none" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Portfolio Manager</h1>
          <p className="text-muted-foreground mt-1">Vue d'ensemble exécutive et suivi dynamique des risques.</p>
        </div>
        <div className="px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-slate-200 shadow-sm text-sm font-medium text-slate-600 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Données en direct
        </div>
      </div>

      {/* Global KPIs - Premium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard 
          title="Polices Actives" 
          value={kpis.portfolio.total_policies.toLocaleString()} 
          icon={<FileText className="h-5 w-5 text-white" />} 
          subtitle="Volume total sécurisé" 
          trend="+2.4% vs 1M"
          gradient="from-slate-800 to-slate-950"
          textColor="text-white"
          iconBg="bg-white/10"
        />
        <MetricCard 
          title="Prime Écrite (GWP)" 
          value={formatEuro(kpis.portfolio.total_premium)} 
          icon={<Euro className="h-5 w-5 text-emerald-100" />} 
          subtitle={`Prime moy: ${formatEuro(kpis.portfolio.total_premium / kpis.portfolio.total_policies)}`} 
          trend="+5.1% vs 1M"
          gradient="from-emerald-500 to-teal-600"
          textColor="text-white"
          iconBg="bg-black/10"
        />
        <MetricCard 
          title="Sinistralité (S/P)" 
          value={`${kpis.kpis.loss_ratio.toFixed(1)}%`} 
          icon={<Activity className={kpis.kpis.loss_ratio > 70 ? 'text-red-500 h-5 w-5' : 'text-amber-500 h-5 w-5'} />} 
          subtitle={`Total: ${formatEuro(kpis.portfolio.total_claim_amount)}`} 
          trend="-1.2% vs 1M"
          gradient="from-white to-slate-50/80"
          textColor="text-slate-900"
          iconBg="bg-slate-100"
          border="border border-slate-200/60"
        />
        <MetricCard 
          title="Sinistres Suspects" 
          value={fraud.global_stats.fraud_claims.toLocaleString()} 
          icon={<ShieldAlert className="h-5 w-5 text-red-500" />} 
          subtitle={`Taux de fraude: ${fraud.global_stats.fraud_rate_pct.toFixed(1)}%`} 
          trend="Stable"
          gradient="from-white to-slate-50/80"
          textColor="text-slate-900"
          iconBg="bg-red-50"
          border="border border-slate-200/60"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tendances Sinistres vs Fraude */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-xl p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-500" />
              Évolution Trimestrielle des Sinistres
            </h3>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="quarter" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis fontSize={12} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" dataKey="total_claims" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" name="Total Sinistres" activeDot={{ r: 6, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="fraud_claims" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorFraud)" name="Sinistres Fraude" activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Réserves IBNR - Dark Widget */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-lg flex flex-col justify-between relative overflow-hidden border border-slate-700/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h3 className="font-semibold text-lg text-white mb-1 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              Provisionnement (IBNR)
            </h3>
            <p className="text-sm text-slate-400 mb-8">Modèle de Chain Ladder globalisé</p>
            
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Réserve Totale IBNR</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 tracking-tight">
                    {formatEuro(reserves.total_ibnr)}
                  </p>
                </div>
              </div>
              
              <div className="h-px w-full bg-gradient-to-r from-slate-700 to-transparent"></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-400">Ratio IBNR / Primes</p>
                  <p className="text-lg font-bold text-white mt-1">{reserves.ibnr_to_premium_ratio.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Marge de Risque</p>
                  <p className="text-lg font-bold text-white mt-1">{formatEuro(reserves.total_ibnr * 0.15)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex items-start gap-3 text-xs text-emerald-200/70 bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/5 relative z-10">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
            <p>La provision actuelle est jugée suffisante par rapport à l'historique de liquidation.</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Analyse Régionale */}
        <div className="rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-xl p-6 shadow-sm transition-all hover:shadow-md">
          <h3 className="font-semibold text-lg text-slate-800 mb-6">Top 5 Régions par S/P</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regions.slice(0, 5)} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="region_code" fontSize={12} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis fontSize={12} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} tick={{fill: '#64748b'}} />
                <RechartsTooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="loss_ratio" name="Loss Ratio (%)" radius={[6, 6, 0, 0]}>
                  {regions.slice(0, 5).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.loss_ratio > 80 ? '#f43f5e' : entry.loss_ratio > 60 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profil de Fraude */}
        <div className="rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-xl p-6 shadow-sm transition-all hover:shadow-md">
          <h3 className="font-semibold text-lg text-slate-800 mb-6">Sinistres par Sévérité d'Incident</h3>
          <div className="flex items-center justify-center h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fraud.by_severity.filter((d: any) => d.count > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="incident_severity"
                  stroke="none"
                  label={({ incident_severity, percent }) => `${incident_severity} ${(percent * 100).toFixed(0)}%`}
                >
                  {
                    fraud.by_severity.filter((d: any) => d.count > 0).map((entry: any, index: number) => {
                      const colors = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#f43f5e'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    })
                  }
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number, name: string, props: any) => [
                    <span key="1" className="font-medium">{val} sinistres (Fraude: {props.payload.fraud_rate_pct.toFixed(1)}%)</span>,
                    name
                  ]} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  )
}

