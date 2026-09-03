import { Clock3, MapPin, FileText, ArrowUpRight } from 'lucide-react'
import type { CivicCase } from '@/lib/civic'
import { SeverityBadge } from '@/components/severity-badge'

export function CaseCard({ civicCase }: { civicCase: CivicCase }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 overflow-hidden rounded-2xl border border-border bg-card duration-700">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/50 px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Civic case
          </p>
          <p className="font-mono text-lg font-semibold tracking-tight">
            {civicCase.id}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning-foreground">
          <Clock3 className="size-3.5" />
          {civicCase.status}
        </span>
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-3">
        <Field icon={MapPin} label="Location" value={civicCase.location} />
        <Field icon={Clock3} label="Filed" value={civicCase.createdAt} />
        <div className="flex flex-col gap-1 bg-card px-6 py-4">
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowUpRight className="size-3.5" />
            Priority
          </span>
          <SeverityBadge severity={civicCase.priority} />
        </div>
      </div>

      <div className="border-t border-border px-6 py-5">
        <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <FileText className="size-3.5" />
          AI-generated complaint
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">
          {civicCase.complaint}
        </p>
      </div>

      <div className="flex items-start gap-3 border-t border-border bg-primary/[0.04] px-6 py-5">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ArrowUpRight className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold">AI Next Action</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {civicCase.nextAction}
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-1 bg-card px-6 py-4">
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
