'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Plus, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { ClaimsStatsBar } from '@/components/claims/claims-stats-bar'
import { ClaimsTable, ClaimRow } from '@/components/claims/claims-table'
import { getRecentClaims, deleteClaim } from '@/lib/api'

export default function ClaimsPage() {
  const [claims, setClaims] = useState<ClaimRow[]>([])

  const fetchClaims = () => {
    getRecentClaims()
      .then((data) => setClaims(data.claims))
      .catch(() => setClaims([]))
  }

  useEffect(() => {
    fetchClaims()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      await deleteClaim(id)
      fetchClaims()
    } catch (err) {
      console.error("Erreur lors de la suppression du sinistre", err)
      alert("Erreur lors de la suppression.")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sinistres Récents"
        description="Portefeuille dynamique — sinistres créés manuellement via le workflow Claims Management."
      >
        <Button asChild>
          <Link href="/claims/new">
            <Plus className="h-4 w-4" /> Nouveau Sinistre
          </Link>
        </Button>
      </PageHeader>

      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          Section distincte des KPIs historiques freMTPL2 (Module 5) — ne pas confondre les deux portefeuilles.
        </p>
      </div>

      <ClaimsStatsBar />
      <ClaimsTable claims={claims} onDelete={handleDelete} />
    </div>
  )
}
