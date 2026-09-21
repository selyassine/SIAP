const SEVERITY_CONFIG = {
  'No Damage Detected': {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    label: 'Aucun Dommage',
  },
  Minor: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Mineur',
  },
  Moderate: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    label: 'Modéré',
  },
  Severe: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    label: 'Sévère',
  },
  'Total Loss': {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    label: 'Perte Totale',
  },
} as const;

type Severity = keyof typeof SEVERITY_CONFIG;

interface SeverityBadgeProps {
  severity: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SeverityBadge({ severity, size = 'md' }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity as Severity] ?? SEVERITY_CONFIG['No Damage Detected'];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  const dotSizes = { sm: 'w-1.5 h-1.5', md: 'w-2 h-2', lg: 'w-2.5 h-2.5' };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium transition-colors
        ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      <span className={`rounded-full shrink-0 ${config.dot} ${dotSizes[size]}`} />
      {config.label}
    </span>
  );
}
