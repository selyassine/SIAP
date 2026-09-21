'use client'

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MetricCard } from "@/components/ui/metric-card"
import {
  Calculator, Files, TrendingDown, Target, Activity,
  ShieldAlert, Camera, BarChart3, Bot, ArrowRight, TrendingUp
} from "lucide-react"

const quickActions = [
  {
    title: "Tarification Individuelle (Smart Pricing)",
    desc: "Évaluez le profil d'un conducteur et d'un véhicule pour générer instantanément une prime commerciale optimisée.",
    href: "/pricing",
    icon: Calculator,
    color: "text-teal-600 bg-teal-500/10",
    variant: "default" as const,
    cta: "Lancer la tarification",
  },
  {
    title: "Chargement de Portefeuille en Lot",
    desc: "Importez un fichier CSV de polices pour évaluer instantanément le risque global et calculer la prime cumulée.",
    href: "/pricing/batch",
    icon: Files,
    color: "text-blue-600 bg-blue-500/10",
    variant: "outline" as const,
    cta: "Importer un CSV",
  },
]

const moduleLinks = [
  { title: "Détection de Fraude", href: "/fraud/detect", icon: ShieldAlert, color: "text-rose-600 bg-rose-500/10 hover:bg-rose-500/20" },
  { title: "Computer Vision (Sinistres)", href: "/vision", icon: Camera, color: "text-blue-600 bg-blue-500/10 hover:bg-blue-500/20" },
  { title: "Provisions IBNR", href: "/reserving", icon: BarChart3, color: "text-indigo-600 bg-indigo-500/10 hover:bg-indigo-500/20" },
  { title: "Assistant IA Actuariel", href: "/assistant", icon: Bot, color: "text-teal-600 bg-teal-500/10 hover:bg-teal-500/20" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-10 pb-10 relative">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-teal-50/40 to-transparent -z-10 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-teal-400/5 blur-[100px] -z-10 pointer-events-none" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Espace Actuariel</h1>
          <p className="text-slate-500 mt-1">Gérez vos analyses de tarification, détection de fraude et suivi de portefeuille en temps réel.</p>
        </div>
        <div className="px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-slate-200/60 shadow-sm text-xs font-semibold text-slate-600 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          Système Actif
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Devis Générés (Mois)"
          value="1 248"
          icon={<Calculator className="h-5 w-5 text-white" />}
          subtitle="Volume des simulations"
          trend="+12.4% vs 1M"
          gradient="from-slate-800 to-slate-950"
          textColor="text-white"
          iconBg="bg-white/10"
        />
        <MetricCard
          title="Prime Moyenne"
          value="432,50 €"
          icon={<Activity className="h-5 w-5 text-emerald-100" />}
          subtitle="Basé sur LightGBM/GLM"
          trend="-2.1% vs 1M"
          gradient="from-emerald-500 to-teal-600"
          textColor="text-white"
          iconBg="bg-black/10"
        />
        <MetricCard
          title="Profils à Haut Risque"
          value="18,2%"
          icon={<TrendingDown className="h-5 w-5 text-amber-600" />}
          subtitle="Nécessite une validation"
          trend="Sous surveillance"
          gradient="from-white to-slate-50/80"
          textColor="text-slate-950"
          iconBg="bg-amber-500/10"
          border="border border-slate-200/60"
        />
        <MetricCard
          title="Gini du Modèle Champion"
          value="0,323"
          icon={<Target className="h-5 w-5 text-indigo-600" />}
          subtitle="LightGBM Frequency"
          trend="Optimal"
          gradient="from-white to-slate-50/80"
          textColor="text-slate-950"
          iconBg="bg-indigo-500/10"
          border="border border-slate-200/60"
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Actions Rapides</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {quickActions.map((action) => (
            <div
              key={action.title}
              className="group rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-teal-500/20 flex flex-col justify-between"
            >
              <div>
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${action.color} mb-4 transition-transform group-hover:scale-110 duration-300`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{action.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500 mb-6">{action.desc}</p>
              </div>
              <Button variant={action.variant} className={action.variant === 'default' ? 'bg-teal-600 hover:bg-teal-700 w-full' : 'w-full'} asChild>
                <Link href={action.href} className="flex items-center justify-center gap-2">
                  {action.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* All Modules */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Modules d'Expertise</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {moduleLinks.map((mod) => (
            <Link
              key={mod.title}
              href={mod.href}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-teal-500/10"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${mod.color} transition-transform group-hover:scale-105`}>
                <mod.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 group-hover:text-teal-600 transition-colors truncate">
                  {mod.title}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Accéder</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
