import { AlertTriangle, Layers, ShieldAlert, Sparkles } from 'lucide-react'
import type { IssueAnalysis } from '@/lib/civic'
import { SeverityBadge } from '@/components/severity-badge'

export function AnalysisCard({ analysis }: { analysis: IssueAnalysis }) {
  const rows = [
    { icon: AlertTriangle, label: 'Issue detected', value: analysis.issue },
    { icon: Layers, label: 'Category', value: analysis.category },
    { icon: ShieldAlert, label: 'Risk', value: analysis.risk },
  ]

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 rounded-2xl border border-border bg-card p-6 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Sparkles className="size-4" />
          AI Analysis
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {Math.round(analysis.confidence * 100)}% confidence
        </span>
      </div>

      <dl className="mt-5 divide-y divide-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 py-3 first:pt-0"
          >
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <row.icon className="size-4" />
              {row.label}
            </dt>
            <dd className="text-right text-sm font-medium">{row.value}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 py-3">
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldAlert className="size-4" />
            Severity
          </dt>
          <dd>
            <SeverityBadge severity={analysis.severity} />
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        {analysis.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
