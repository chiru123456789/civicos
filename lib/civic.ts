/**
 * CivicOS domain logic.
 *
 * This module intentionally isolates all "intelligence" and persistence behind
 * small, typed functions so the demo can later be swapped for real services:
 *
 *   - `analyzeIssue()`  -> replace with a Groq API call (vision + reasoning)
 *   - `createCase()`    -> replace with a Supabase insert
 *
 * The UI only depends on these signatures, so wiring real APIs later means
 * changing the bodies of these functions, not the components.
 */

export type Severity = 'Low' | 'Medium' | 'High'

export type IssueAnalysis = {
  issue: string
  category: string
  severity: Severity
  risk: string
  confidence: number
  tags: string[]
}

export type CivicCase = {
  id: string
  location: string
  status: string
  priority: Severity
  complaint: string
  nextAction: string
  createdAt: string
}

export type ReportInput = {
  imageName?: string
  location: string
  description: string
}

/** Simulated latency to make the demo feel like real inference. */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * DEMO: Analyze a civic issue.
 * Later: send the image + description to the Groq API and parse the response.
 */
export async function analyzeIssue(_input: ReportInput): Promise<IssueAnalysis> {
  await delay(2000)

  return {
    issue: 'Pothole',
    category: 'Road Infrastructure',
    severity: 'High',
    risk: 'Vehicle safety / traffic disruption',
    confidence: 0.94,
    tags: ['Road surface', 'Two-wheeler hazard', 'Monsoon risk'],
  }
}

/**
 * DEMO: Create a structured civic case from an analysis.
 * Later: persist to Supabase and return the stored row.
 */
export async function createCase(
  input: ReportInput,
  analysis: IssueAnalysis,
): Promise<CivicCase> {
  await delay(600)

  const location = input.location.trim() || 'Bengaluru (location not specified)'

  const complaint = `A ${analysis.severity.toLowerCase()}-severity ${analysis.issue.toLowerCase()} has been identified at ${location}. This ${analysis.category.toLowerCase()} issue poses a risk of ${analysis.risk.toLowerCase()} and requires municipal attention. ${
    input.description.trim()
      ? `Citizen note: "${input.description.trim()}"`
      : 'Immediate inspection and repair are recommended to prevent accidents and further road deterioration.'
  }`

  return {
    id: 'BLR-00127',
    location,
    status: 'Awaiting Resolution',
    priority: analysis.severity,
    complaint,
    nextAction: 'Monitor this case and follow up if unresolved.',
    createdAt: new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
  }
}
