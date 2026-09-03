'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import {
  ImageUp,
  Loader2,
  MapPin,
  Sparkles,
  X,
  RotateCcw,
  LocateFixed,
  CheckCircle2,
} from 'lucide-react'
import {
  analyzeIssue,
  createCase,
  compressImage,
  type CivicCase,
  type GeoLocation,
  type IssueAnalysis,
  type ReportInput,
} from '@/lib/civic'
import { AnalysisCard } from '@/components/analysis-card'
import { CaseCard } from '@/components/case-card'

type Status = 'idle' | 'analyzing' | 'done'

export function ReportSection() {
  const [status, setStatus] = useState<Status>('idle')
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | undefined>()
  const [imageSignature, setImageSignature] = useState<string | undefined>()
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [analysis, setAnalysis] = useState<IssueAnalysis | null>(null)
  const [civicCase, setCivicCase] = useState<CivicCase | null>(null)

  // GPS state
  const [geo, setGeo] = useState<GeoLocation | null>(null)
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'error'>(
    'idle',
  )
  const [geoError, setGeoError] = useState<string | null>(null)
  const [manualOverride, setManualOverride] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setFileName(file.name)
    // Compress/resize in-browser for a faster, lighter analysis payload.
    try {
      const { dataUrl, signature } = await compressImage(file)
      setPreview(dataUrl)
      setImageSignature(signature)
    } catch {
      setPreview(URL.createObjectURL(file))
      setImageSignature(`${file.name}:${file.size}`)
    }
  }

  function clearImage() {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    setPreview(null)
    setFileName(undefined)
    setImageSignature(undefined)
    if (inputRef.current) inputRef.current.value = ''
  }

  function useCurrentLocation() {
    if (!('geolocation' in navigator)) {
      setGeoStatus('error')
      setGeoError('Geolocation is not supported on this device.')
      return
    }
    setGeoStatus('locating')
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        })
        setGeoStatus('idle')
        setManualOverride(false)
      },
      (err) => {
        setGeoStatus('error')
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied. Enter the location manually below.'
            : 'Could not get your location. Enter it manually below.',
        )
        setManualOverride(true)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  function clearGeo() {
    setGeo(null)
    setGeoStatus('idle')
    setGeoError(null)
  }

  async function handleAnalyze() {
    setStatus('analyzing')
    setAnalysis(null)
    setCivicCase(null)

    const input: ReportInput = {
      imageName: fileName,
      imageSignature,
      location,
      geo,
      description,
    }
    const result = await analyzeIssue(input)
    setAnalysis(result)
    const generated = await createCase(input, result)
    setCivicCase(generated)
    setStatus('done')
  }

  function resetAll() {
    clearImage()
    clearGeo()
    setLocation('')
    setDescription('')
    setAnalysis(null)
    setCivicCase(null)
    setManualOverride(false)
    setStatus('idle')
  }

  // A location is required: either GPS is captured or a manual label is typed.
  const hasLocation = Boolean(geo) || location.trim().length > 0
  const canAnalyze =
    status !== 'analyzing' &&
    hasLocation &&
    (preview || location.trim() || description.trim())

  const osmBox = geo
    ? `${geo.lng - 0.004}%2C${geo.lat - 0.003}%2C${geo.lng + 0.004}%2C${geo.lat + 0.003}`
    : null

  return (
    <section id="report" className="scroll-mt-20 bg-secondary/40 py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Report a Civic Issue
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            Upload a photo, capture your GPS location, and let CivicOS turn it
            into a structured case. No sign-in required.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-2">
          {/* Form */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-7">
            <label
              htmlFor="issue-image"
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                handleFiles(e.dataTransfer.files)
              }}
              className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                dragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-muted/40 hover:border-primary/50 hover:bg-muted/70'
              }`}
            >
              {preview ? (
                <div className="w-full">
                  <div className="relative mx-auto aspect-video w-full overflow-hidden rounded-lg border border-border">
                    <Image
                      src={preview || '/placeholder.svg'}
                      alt="Uploaded civic issue preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <p className="mt-3 truncate text-xs text-muted-foreground">
                    {fileName}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      clearImage()
                    }}
                    className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                    aria-label="Remove image"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ImageUp className="size-6" />
                  </span>
                  <p className="mt-4 text-sm font-medium">
                    Drag &amp; drop a photo here
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    or click to browse · compressed automatically for speed
                  </p>
                </>
              )}
              <input
                ref={inputRef}
                id="issue-image"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>

            {/* GPS location */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Location
                </span>
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={geoStatus === 'locating'}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-60"
                >
                  {geoStatus === 'locating' ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <LocateFixed className="size-3.5 text-primary" />
                  )}
                  Use current location
                </button>
              </div>

              {geo && (
                <div className="animate-in fade-in overflow-hidden rounded-xl border border-border">
                  {osmBox && (
                    <iframe
                      title="Location preview"
                      className="h-36 w-full border-0"
                      loading="lazy"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${osmBox}&layer=mapnik&marker=${geo.lat}%2C${geo.lng}`}
                    />
                  )}
                  <div className="flex items-center justify-between gap-3 bg-primary/[0.04] px-3 py-2">
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground">
                      <CheckCircle2 className="size-3.5 text-primary" />
                      {geo.lat.toFixed(5)}, {geo.lng.toFixed(5)}
                      <span className="text-muted-foreground">
                        · ±{Math.round(geo.accuracy)}m
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={clearGeo}
                      className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {geoError && (
                <p className="text-xs text-destructive">{geoError}</p>
              )}

              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={
                    geo
                      ? 'Add a landmark or adjust the address (optional)'
                      : 'e.g. 100 Feet Road, Indiranagar, Bengaluru'
                  }
                  className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
              {!hasLocation && (
                <p className="text-xs text-muted-foreground">
                  {manualOverride
                    ? 'Enter the location manually to continue.'
                    : 'Capture GPS or type a location to submit a report.'}
                </p>
              )}
            </div>

            <div className="mt-4 space-y-1.5">
              <label
                htmlFor="description"
                className="text-sm font-medium text-foreground"
              >
                Describe the problem
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Large pothole in the middle of the lane, worsens after rain and forces two-wheelers to swerve."
                className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
              >
                {status === 'analyzing' ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Analyze &amp; Report
                  </>
                )}
              </button>
              {status === 'done' && (
                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <RotateCcw className="size-4" />
                  New report
                </button>
              )}
            </div>
          </div>

          {/* Result column */}
          <div className="flex flex-col gap-6">
            {status === 'idle' && <IdleState />}

            {status === 'analyzing' && <AnalyzingState />}

            {analysis && (
              <AnalysisCard
                analysis={analysis}
                onConfirm={(updated) => setAnalysis(updated)}
              />
            )}
            {civicCase && <CaseCard civicCase={civicCase} />}
          </div>
        </div>
      </div>
    </section>
  )
}

function IdleState() {
  return (
    <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Sparkles className="size-6" />
      </span>
      <p className="mt-4 text-sm font-medium">Your AI analysis appears here</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">
        Add your report details and click Analyze &amp; Report to generate a
        structured civic case.
      </p>
    </div>
  )
}

function AnalyzingState() {
  const lines = [
    'Compressing image for fast upload…',
    'Classifying issue category…',
    'Assessing severity and confidence…',
    'Drafting civic case…',
  ]
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 text-sm font-medium text-primary">
        <Loader2 className="size-4 animate-spin" />
        Running AI analysis
      </div>
      <div className="mt-5 space-y-3">
        {lines.map((line, i) => (
          <div
            key={line}
            className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2"
            style={{ animationDelay: `${i * 300}ms`, animationFillMode: 'both' }}
          >
            <span className="size-1.5 rounded-full bg-primary/60" />
            <span className="text-sm text-muted-foreground">{line}</span>
          </div>
        ))}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
        </div>
      </div>
    </div>
  )
}
