"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { predict } from '@/lib/api'
import { PricingInput, PricingOutput } from '@/lib/types'
import { Loader2 } from 'lucide-react'

export function PricingForm({ onResult }: { onResult: (data: PricingOutput) => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<PricingInput>({
    veh_power: 5,
    veh_age: 2,
    driv_age: 40,
    bonus_malus: 60,
    density: 100,
    area: 'C',
    veh_brand: 'B2',
    veh_gas: 'Regular',
    region: 'R11',
    exposure: 1.0
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const numFields = ['veh_power', 'veh_age', 'driv_age', 'bonus_malus', 'density', 'exposure']
    
    setFormData(prev => ({
      ...prev,
      [name]: numFields.includes(name) ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const result = await predict(formData)
      onResult(result)
    } catch (err: any) {
      setError(err.response?.data?.detail || "An error occurred during prediction")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border border-slate-200/60 bg-white/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-200/40 bg-transparent py-5">
        <CardTitle className="text-xl font-bold text-slate-800">Détails de la Police</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-teal-600 uppercase tracking-widest">Profil du Conducteur</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="driv_age" className="text-slate-600 font-semibold">Âge du Conducteur</Label>
                <Input id="driv_age" name="driv_age" type="number" min="18" max="99" value={formData.driv_age} onChange={handleChange} required className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bonus_malus" className="text-slate-600 font-semibold">Bonus / Malus (CRM)</Label>
                <Input id="bonus_malus" name="bonus_malus" type="number" min="50" max="350" value={formData.bonus_malus} onChange={handleChange} required className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-teal-600 uppercase tracking-widest">Informations du Véhicule</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="veh_power" className="text-slate-600 font-semibold">Puissance Fiscale (CV)</Label>
                <Input id="veh_power" name="veh_power" type="number" min="1" max="20" value={formData.veh_power} onChange={handleChange} required className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="veh_age" className="text-slate-600 font-semibold">Âge du Véhicule (Années)</Label>
                <Input id="veh_age" name="veh_age" type="number" min="0" max="100" value={formData.veh_age} onChange={handleChange} required className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="veh_brand" className="text-slate-600 font-semibold">Marque du Véhicule</Label>
                <Select id="veh_brand" name="veh_brand" value={formData.veh_brand} onChange={handleChange} required className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500 h-11">
                  {Array.from({length: 14}, (_, i) => `B${i+1}`).map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="veh_gas" className="text-slate-600 font-semibold">Carburant</Label>
                <Select id="veh_gas" name="veh_gas" value={formData.veh_gas} onChange={handleChange} required className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500 h-11">
                  <option value="Regular">Regular</option>
                  <option value="Diesel">Diesel</option>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-teal-600 uppercase tracking-widest">Localisation & Exposition</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area" className="text-slate-600 font-semibold">Zone (Area Code)</Label>
                <Select id="area" name="area" value={formData.area} onChange={handleChange} required className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500 h-11">
                  {['A','B','C','D','E','F'].map(a => <option key={a} value={a}>{a}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="region" className="text-slate-600 font-semibold">Région</Label>
                <Select id="region" name="region" value={formData.region} onChange={handleChange} required className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500 h-11">
                  {["R11","R21","R22","R23","R24","R25","R26","R31","R41","R42","R43","R52","R53","R54","R72","R73","R74","R82","R83","R91","R93","R94"].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="density" className="text-slate-600 font-semibold">Densité de Population</Label>
                <Input id="density" name="density" type="number" step="0.1" min="1" value={formData.density} onChange={handleChange} required className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exposure" className="text-slate-600 font-semibold">Exposition (Fraction Année)</Label>
                <Input id="exposure" name="exposure" type="number" step="0.01" min="0" max="1" value={formData.exposure} onChange={handleChange} required className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
            </div>
          </div>

          {error && <div className="text-red-600 text-sm font-medium bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl">{error}</div>}

          <Button type="submit" className="w-full h-12 text-md font-bold rounded-xl bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-500/20 transition-all active:scale-[0.98]" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyse Actuarielle...</> : "Calculer la Prime"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
