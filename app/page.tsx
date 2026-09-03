import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { HowItWorks } from '@/components/how-it-works'
import { ReportSection } from '@/components/report-section'
import { About, SiteFooter } from '@/components/about-footer'

export default function Page() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <Hero />
        <HowItWorks />
        <ReportSection />
        <About />
      </main>
      <SiteFooter />
    </div>
  )
}
