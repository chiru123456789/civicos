import { CivicMark } from '@/components/civic-mark'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <CivicMark className="size-7 text-primary" />
          <span className="text-lg font-semibold tracking-tight">
            Civic<span className="text-primary">OS</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#about" className="transition-colors hover:text-foreground">
            About
          </a>
        </nav>

        <a
          href="#report"
          className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-sm active:translate-y-px"
        >
          Report Issue
        </a>
      </div>
    </header>
  )
}
