const STATUS_CONFIG = {
  pending:  { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'En attente' },
  reviewed: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Révisé' },
  closed:   { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Clôturé' },
} as const

export function ClaimStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  )
}
