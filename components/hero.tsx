import Image from 'next/image'
import { ArrowRight, MapPin } from 'lucide-react'

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-24">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            From observation to action
          </span>

          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            See a problem. Let AI take it forward.
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            CivicOS turns everyday civic observations into structured,
            actionable cases.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#report"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md active:translate-y-px"
            >
              Report a Civic Issue
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-card px-6 text-base font-medium text-foreground transition-colors hover:bg-muted"
            >
              How it works
            </a>
          </div>

          <p className="mt-5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 text-primary" />
            Starting with Bengaluru.
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <Image
              src="/images/bengaluru-road.png"
              alt="A Bengaluru street with a visible pothole in soft morning light"
              width={900}
              height={720}
              priority
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/85 px-4 py-3 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin className="size-4" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-medium">Pothole detected</p>
                  <p className="text-xs text-muted-foreground">
                    Road Infrastructure · High severity
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-warning/15 px-2.5 py-1 font-mono text-xs font-medium text-warning-foreground">
                94%
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
