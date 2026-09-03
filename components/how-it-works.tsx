import { Camera, ScanSearch, FileCheck2, BellRing } from 'lucide-react'

const steps = [
  {
    icon: Camera,
    title: 'Capture',
    body: 'Upload a photo of the civic problem and add its location and a short description.',
  },
  {
    icon: ScanSearch,
    title: 'Analyze',
    body: 'AI identifies the issue, classifies its category, and assesses severity and risk.',
  },
  {
    icon: FileCheck2,
    title: 'Structure',
    body: 'A formal civic case is generated with a case ID, priority, and complaint text.',
  },
  {
    icon: BellRing,
    title: 'Follow up',
    body: 'Track the case status and get an AI-recommended next action until it is resolved.',
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-6xl px-5 py-20 sm:px-8"
    >
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-primary">How it works</p>
        <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Four steps from observation to action
        </h2>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
          CivicOS handles the reasoning and paperwork so a single photo becomes
          a case a civic body can act on.
        </p>
      </div>

      <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="size-5" />
              </span>
              <span className="font-mono text-sm text-muted-foreground">
                0{i + 1}
              </span>
            </div>
            <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
