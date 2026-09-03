import { CivicMark } from '@/components/civic-mark'

export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <div className="grid gap-10 rounded-3xl border border-border bg-card p-8 sm:p-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-sm font-medium text-primary">About</p>
          <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight">
            Civic infrastructure, reimagined as software
          </h2>
        </div>
        <div className="space-y-4 text-pretty leading-relaxed text-muted-foreground">
          <p>
            Most civic problems go unreported because reporting them is slow and
            unclear. CivicOS removes that friction: a single photo becomes a
            structured, prioritized case that a civic body can act on.
          </p>
          <p>
            This first prototype focuses on{' '}
            <span className="font-medium text-foreground">road potholes</span>{' '}
            in Bengaluru — one of the city&apos;s most common and highest-risk
            infrastructure issues — with more categories to follow.
          </p>
        </div>
      </div>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row sm:px-8">
        <div className="flex items-center gap-2.5">
          <CivicMark className="size-6 text-primary" />
          <span className="font-semibold tracking-tight">
            Civic<span className="text-primary">OS</span>
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          From observation to action · Starting with Bengaluru
        </p>
        <p className="text-xs text-muted-foreground">
          Prototype demo · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
