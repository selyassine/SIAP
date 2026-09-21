import { Database } from "lucide-react";

interface SourceBadgeProps {
  source: string;
}

export function SourceBadge({ source }: SourceBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full">
      <Database className="w-3 h-3 text-teal-500" />
      <span>Source : {source}</span>
    </div>
  );
}
