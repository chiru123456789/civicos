'use client'

import {
  AlertTriangle,
  Building2,
  Layers,
  ShieldAlert,
  Sparkles,
  Wrench,
  HelpCircle,
  Check,
} from 'lucide-react'
import {
  analysisForIssueType,
  ISSUE_TYPE_OPTIONS,
  type IssueAnalysis,
  type IssueType,
} from '@/lib/civic'
import { SeverityBadge } from '@/components/severity-badge'

export function AnalysisCard({
  analysis,
  onConfirm,
}: {
  analysis: IssueAnalysis
  onConfirm?: (updated: IssueAnalysis) => void
}) {
  const rows = [
    { icon: AlertTriangle, label: 'Issue detected', value: analysis.issue },
    { icon: Layers, label: 'Category', value: analysis.category },
    { icon: ShieldAlert, label: 'Risk', value: analysis.risk },
    { icon: Wrench, label: 'Recommended action', value: analysis.recommendedAction },
    { icon: Building2, label: 'Authority', value: analysis.responsibleAuthority },
  ]

  const confidencePct = Math.round(analysis.confidence * 100)

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 rounded-2xl border border-border bg-card p-6 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Sparkles className="size-4" />
          AI Analysis
        </div>
        <span
          className={`font-mono text-xs ${
            analysis.needsConfirmation
              ? 'text-warning-foreground'
              : 'text-muted-foreground'
          }`}
        >
          {confidencePct}% confidence
        </span>
      </div>

      {analysis.needsConfirmation && (
        <div className="mt-4 rounded-xl border border-warning/30 bg-warning/10 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-warning-foreground">
            <HelpCircle className="size-4" />
            Needs confirmation
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Confidence is low, so CivicOS isn&apos;t sure about this one. Confirm
            the detected issue or pick the correct type.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label htmlFor="issue-correction" className="sr-only">
              Correct issue type
            </label>
            <select
              id="issue-correction"
              defaultValue={analysis.issueType}
              onChange={(e) =>
                onConfirm?.(
                  analysisForIssueType(e.target.value as IssueType, analysis),
                )
              }
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              {ISSUE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() =>
                onConfirm?.(analysisForIssueType(analysis.issueType, analysis))
              }
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Check className="size-3.5" />
              Confirm issue
            </button>
          </div>
        </div>
      )}

      <dl className="mt-5 divide-y divide-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-4 py-3 first:pt-0"
          >
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <row.icon className="size-4 shrink-0" />
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
