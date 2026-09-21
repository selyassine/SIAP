import { BatchUpload } from "@/components/pricing/batch-upload"

export default function BatchPricingPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Batch Portfolio Pricing</h2>
        <p className="text-slate-500 mt-2">Evaluate multiple policies at once to understand the overall risk distribution and expected premiums.</p>
      </div>
      
      <BatchUpload />
    </div>
  )
}
