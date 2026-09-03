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

/** Canonical civic issue categories the detector can classify. */
export type IssueType =
  | 'pothole'
  | 'garbage'
  | 'broken_streetlight'
  | 'waterlogging'
  | 'damaged_footpath'
  | 'open_manhole'
  | 'road_damage'
  | 'fallen_tree'
  | 'signage_damage'
  | 'other'

export type IssueAnalysis = {
  /** Machine-readable issue type from the taxonomy. */
  issueType: IssueType
  /** Human-friendly issue label (e.g. "Pothole"). */
  issue: string
  category: string
  severity: Severity
  risk: string
  /** 0..1 model confidence. */
  confidence: number
  /** True when confidence is below the reliable threshold. */
  needsConfirmation: boolean
  description: string
  recommendedAction: string
  responsibleAuthority: string
  tags: string[]
}

/** Captured device location. */
export type GeoLocation = {
  lat: number
  lng: number
  accuracy: number
  timestamp: number
}

export type CivicCase = {
  id: string
  location: string
  geo: GeoLocation | null
  status: string
  priority: Severity
  confidence: number
  complaint: string
  nextAction: string
  createdAt: string
}

export type ReportInput = {
  imageName?: string
  /** Signature of the compressed image, used only for cache keys. */
  imageSignature?: string
  location: string
  geo?: GeoLocation | null
}

/** Confidence below this is treated as "needs confirmation". */
export const CONFIDENCE_THRESHOLD = 0.65

/** Simulated latency to make the demo feel like real inference. */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type IssueProfile = {
  issueType: IssueType
  issue: string
  category: string
  severity: Severity
  risk: string
  recommendedAction: string
  responsibleAuthority: string
  tags: string[]
  /** Keywords that map free text to this issue. */
  keywords: string[]
}

/**
 * The detection taxonomy. In production the vision model returns `issueType`
 * directly; here we match keywords from the description/filename against it.
 */
const ISSUE_PROFILES: IssueProfile[] = [
  {
    issueType: 'pothole',
    issue: 'Pothole',
    category: 'Road Infrastructure',
    severity: 'High',
    risk: 'Vehicle safety / traffic disruption',
    recommendedAction: 'Road surface repair and resurfacing',
    responsibleAuthority: 'Roads & Infrastructure Department',
    tags: ['Road surface', 'Two-wheeler hazard', 'Monsoon risk'],
    keywords: ['pothole', 'pot hole', 'crater', 'road hole', 'holes'],
  },
  {
    issueType: 'garbage',
    issue: 'Garbage / Waste Dump',
    category: 'Solid Waste Management',
    severity: 'Medium',
    risk: 'Public health / sanitation hazard',
    recommendedAction: 'Waste clearance and regular collection',
    responsibleAuthority: 'Solid Waste Management Department',
    tags: ['Sanitation', 'Health hazard', 'Odour'],
    keywords: ['garbage', 'trash', 'waste', 'dump', 'rubbish', 'litter', 'debris'],
  },
  {
    issueType: 'broken_streetlight',
    issue: 'Broken Streetlight',
    category: 'Public Lighting',
    severity: 'Medium',
    risk: 'Night-time safety / accident risk',
    recommendedAction: 'Streetlight inspection and bulb/fixture replacement',
    responsibleAuthority: 'Electrical / Street Lighting Department',
    tags: ['Night safety', 'Electrical', 'Visibility'],
    keywords: ['streetlight', 'street light', 'lamp', 'light not working', 'dark', 'lighting'],
  },
  {
    issueType: 'waterlogging',
    issue: 'Waterlogging / Flooding',
    category: 'Drainage & Storm Water',
    severity: 'High',
    risk: 'Flooding / vehicle and pedestrian hazard',
    recommendedAction: 'Drain clearing and storm-water management',
    responsibleAuthority: 'Storm Water Drain Department',
    tags: ['Drainage', 'Monsoon risk', 'Flooding'],
    keywords: ['waterlog', 'water log', 'flood', 'stagnant', 'water logging', 'drain overflow'],
  },
  {
    issueType: 'damaged_footpath',
    issue: 'Damaged Footpath',
    category: 'Pedestrian Infrastructure',
    severity: 'Medium',
    risk: 'Pedestrian trip / fall hazard',
    recommendedAction: 'Footpath slab repair and levelling',
    responsibleAuthority: 'Roads & Infrastructure Department',
    tags: ['Pedestrian', 'Accessibility', 'Trip hazard'],
    keywords: ['footpath', 'sidewalk', 'pavement', 'walkway', 'broken slab'],
  },
  {
    issueType: 'open_manhole',
    issue: 'Open Manhole',
    category: 'Sewerage & Drainage',
    severity: 'High',
    risk: 'Fall injury / drowning hazard',
    recommendedAction: 'Immediate covering and manhole restoration',
    responsibleAuthority: 'Sewerage Board',
    tags: ['Critical hazard', 'Uncovered', 'Fall risk'],
    keywords: ['manhole', 'man hole', 'open drain', 'uncovered', 'sewer hole'],
  },
  {
    issueType: 'road_damage',
    issue: 'Road Damage',
    category: 'Road Infrastructure',
    severity: 'High',
    risk: 'Vehicle damage / traffic disruption',
    recommendedAction: 'Road repair and structural assessment',
    responsibleAuthority: 'Roads & Infrastructure Department',
    tags: ['Road surface', 'Structural', 'Traffic'],
    keywords: ['road damage', 'cracked road', 'broken road', 'crack', 'sunken', 'caved'],
  },
  {
    issueType: 'fallen_tree',
    issue: 'Fallen Tree',
    category: 'Parks & Horticulture',
    severity: 'High',
    risk: 'Road blockage / injury hazard',
    recommendedAction: 'Tree removal and road clearing',
    responsibleAuthority: 'Forest / Horticulture Department',
    tags: ['Obstruction', 'Storm damage', 'Blockage'],
    keywords: ['tree', 'branch', 'fallen tree', 'uprooted', 'log'],
  },
  {
    issueType: 'signage_damage',
    issue: 'Traffic / Signage Damage',
    category: 'Traffic Management',
    severity: 'Medium',
    risk: 'Traffic confusion / accident risk',
    recommendedAction: 'Signage or signal repair and replacement',
    responsibleAuthority: 'Traffic Police / Roads Department',
    tags: ['Traffic', 'Signage', 'Safety'],
    keywords: ['sign', 'signal', 'signage', 'traffic light', 'board', 'traffic sign'],
  },
]

const OTHER_PROFILE: IssueProfile = {
  issueType: 'other',
  issue: 'Unclassified Civic Issue',
  category: 'General Civic',
  severity: 'Medium',
  risk: 'Requires manual review',
  recommendedAction: 'Manual review and routing to the relevant department',
  responsibleAuthority: 'Municipal Grievance Cell',
  tags: ['Needs review'],
  keywords: [],
}

/** Whole-word (or whole-phrase) keyword match to avoid substring false hits. */
function matchesKeyword(haystack: string, keyword: string) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\b${escaped}\\b`).test(haystack)
}

/** Simple in-memory cache so re-analyzing the same input is instant. */
const analysisCache = new Map<string, IssueAnalysis>()

function cacheKey(input: ReportInput) {
  return input.imageSignature ?? input.imageName ?? 'no-image'
}

/**
 * Compress and resize an image entirely in the browser before "sending" it to
 * the model. This is the main speed win: smaller payloads analyze faster.
 * Returns a compact JPEG data URL plus a lightweight signature for caching.
 */
export async function compressImage(
  file: File,
  maxDimension = 1024,
  quality = 0.7,
): Promise<{ dataUrl: string; signature: string }> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('Could not get canvas context')
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const dataUrl = canvas.toDataURL('image/jpeg', quality)
  const signature = `${file.name}:${file.size}:${width}x${height}`
  return { dataUrl, signature }
}

/**
 * DEMO: Analyze a civic issue.
 * Later: send the compressed image + description to the Groq API and parse the
 * structured JSON response. The shape below mirrors that response exactly.
 */
export async function analyzeIssue(input: ReportInput): Promise<IssueAnalysis> {
  const key = cacheKey(input)
  const cached = analysisCache.get(key)
  if (cached) {
    // Cache hit: return almost instantly, no re-inference.
    await delay(150)
    return cached
  }

  await delay(900)

  // The vision model infers the issue directly from the uploaded photo. In this
  // demo we derive it from the image filename; production replaces this with a
  // Groq vision call that returns the structured analysis (including the
  // auto-generated description) from the image alone.
  const haystack = `${input.imageName ?? ''}`.toLowerCase()

  // Score each profile by whole-word keyword matches. Word boundaries prevent
  // false positives like "street" matching "tree" via naive substring search.
  let best: IssueProfile | null = null
  let bestScore = 0
  for (const profile of ISSUE_PROFILES) {
    const score = profile.keywords.reduce(
      (acc, kw) => (matchesKeyword(haystack, kw) ? acc + 1 : acc),
      0,
    )
    if (score > bestScore) {
      bestScore = score
      best = profile
    }
  }

  const profile = best ?? OTHER_PROFILE

  // Confidence rises with the strength of the match; unmatched inputs stay low
  // so the UI can ask the citizen to confirm the detected issue.
  let confidence: number
  if (!best) {
    confidence = 0.45
  } else {
    confidence = Math.min(0.97, 0.7 + bestScore * 0.08)
  }

  const analysis: IssueAnalysis = {
    issueType: profile.issueType,
    issue: profile.issue,
    category: profile.category,
    severity: profile.severity,
    risk: profile.risk,
    confidence,
    needsConfirmation: confidence < CONFIDENCE_THRESHOLD,
    description: `${profile.issue} affecting the ${profile.category.toLowerCase()}.`,
    recommendedAction: profile.recommendedAction,
    responsibleAuthority: profile.responsibleAuthority,
    tags: profile.tags,
  }

  analysisCache.set(key, analysis)
  return analysis
}

/** Return the display profile for a manually confirmed/corrected issue type. */
export function analysisForIssueType(
  issueType: IssueType,
  base: IssueAnalysis,
): IssueAnalysis {
  const profile =
    ISSUE_PROFILES.find((p) => p.issueType === issueType) ?? OTHER_PROFILE
  return {
    ...base,
    issueType: profile.issueType,
    issue: profile.issue,
    category: profile.category,
    severity: profile.severity,
    risk: profile.risk,
    description: `${profile.issue} affecting the ${profile.category.toLowerCase()}.`,
    recommendedAction: profile.recommendedAction,
    responsibleAuthority: profile.responsibleAuthority,
    tags: profile.tags,
    // Citizen-confirmed: treat as reliable.
    confidence: Math.max(base.confidence, 0.9),
    needsConfirmation: false,
  }
}

/** All selectable issue types for the confirmation dropdown. */
export const ISSUE_TYPE_OPTIONS: { value: IssueType; label: string }[] = [
  ...ISSUE_PROFILES.map((p) => ({ value: p.issueType, label: p.issue })),
  { value: OTHER_PROFILE.issueType, label: OTHER_PROFILE.issue },
]

function formatCoords(geo: GeoLocation) {
  return `${geo.lat.toFixed(5)}, ${geo.lng.toFixed(5)}`
}

/**
 * DEMO: Create a structured civic case from an analysis.
 * Later: persist to Supabase and return the stored row.
 */
export async function createCase(
  input: ReportInput,
  analysis: IssueAnalysis,
): Promise<CivicCase> {
  await delay(500)

  const manualLabel = input.location.trim()
  const geo = input.geo ?? null
  const location =
    manualLabel ||
    (geo ? `GPS ${formatCoords(geo)}` : 'Bengaluru (location not specified)')

  const locationSentence = geo
    ? `${location} (GPS ${formatCoords(geo)}, ±${Math.round(geo.accuracy)}m)`
    : location

  const complaint = `A ${analysis.severity.toLowerCase()}-severity ${analysis.issue.toLowerCase()} has been identified at ${locationSentence}. This ${analysis.category.toLowerCase()} issue poses a risk of ${analysis.risk.toLowerCase()} and requires attention from the ${analysis.responsibleAuthority}. Recommended action: ${analysis.recommendedAction.toLowerCase()}. Immediate inspection is recommended to prevent accidents and further deterioration.`

  return {
    id: 'BLR-00127',
    location,
    geo,
    status: 'Awaiting Resolution',
    priority: analysis.severity,
    confidence: analysis.confidence,
    complaint,
    nextAction: `Routed to ${analysis.responsibleAuthority}. Monitor this case and follow up if unresolved.`,
    createdAt: new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
  }
}
