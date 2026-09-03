import { cn } from '@/lib/utils'
import type { Severity } from '@/lib/civic'

const styles: Record<Severity, string> = {
  Low: 'bg-success/15 text-success-foreground',
  Medium: 'bg-warning/15 text-warning-foreground',
  High: 'bg-destructive/12 text-destructive',
}

export function SeverityBadge({
  severity,
  label,
}: {
  severity: Severity
  label?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        styles[severity],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label ?? severity}
    </span>
  )
}
