import { GenerateReportCard } from '@/components/reports/generate-report-card'
import { PageHeader } from '@/components/layout/page-header'

export default function ReportsPage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <PageHeader
        title="Rapports Actuariels"
        description="Générez un rapport PDF complet du portefeuille avec KPIs, graphiques et commentaires interprétatifs générés par IA."
      />
      <GenerateReportCard />
    </div>
  )
}
