import { useEffect, useState, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { getInvestigationDetail, deleteInvestigation } from "../api/detection"
import { getApiUrl } from "../api/client"
import type { InvestigationDetail } from "../types/detection"

function formatDate(d: string | null | undefined): string {
  if (!d) return "\u2014"
  return new Date(d).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function ConfidenceMeter({ value, possibleTampering }: { value: number; possibleTampering: boolean }) {
  const pct = Math.round(value * 100)
  const segments = 12
  const filled = Math.round(pct / (100 / segments))
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">
          Confidence Score
        </span>
        <span className={`text-3xl font-bold tabular-nums ${
          pct >= 80 ? "text-semantic-success" : pct >= 40 ? "text-semantic-warning" : "text-semantic-error"
        }`}>
          {pct}%
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: segments }, (_, i) => (
          <div
            key={i}
            className={`h-3 flex-1 rounded-sm transition-all duration-700 ${
              i < filled
                ? pct >= 80
                  ? "bg-semantic-success"
                  : pct >= 40
                    ? "bg-semantic-warning"
                    : "bg-semantic-error"
                : "bg-surface-700"
            }`}
          />
        ))}
      </div>
      {possibleTampering && (
          <div className="rounded-[12px] border border-semantic-warning/20 bg-semantic-warning/5 px-3.5 py-2.5 text-sm text-semantic-warning">
          Possible tampering detected &mdash; image may have been cropped or edited
        </div>
      )}
    </div>
  )
}

function TimelineStep({
  time,
  title,
  description,
  isLast,
}: {
  time: string
  title: string
  description: string
  isLast: boolean
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="mt-1.5 h-2.5 w-2.5 rounded-full border border-surface-700 bg-surface-800" />
        {!isLast && <div className="mt-1 w-px flex-1 bg-surface-700" />}
      </div>
      <div className={`pb-7 ${isLast ? "" : ""}`}>
        <p className="text-sm text-surface-400">{time}</p>
        <p className="mt-0.5 text-sm font-semibold text-surface-200">{title}</p>
        <p className="mt-0.5 text-sm text-surface-400 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function evidenceSummary(data: InvestigationDetail): string {
  if (data.match_found && data.recipient_name) {
    const pct = Math.round(data.confidence * 100)
    let summary = `Matched to ${data.recipient_name} with ${pct}% confidence.`
    if (data.detected_watermark_id) {
      summary += ` Watermark ${data.detected_watermark_id} was recovered from the leaked image.`
    }
    if (data.possible_tampering) {
      summary += " Possible tampering detected — the image may have been cropped or edited."
    }
    return summary
  }
  const pct = Math.round(data.confidence * 100)
  let summary = `No match found (${pct}% confidence).`
  if (data.possible_tampering) {
    summary += " Possible tampering detected."
  }
  return summary
}

export default function InvestigationReport() {
  const { id } = useParams<{ id: string }>()
  const investigationId = Number(id)
  const navigate = useNavigate()
  const reportRef = useRef<HTMLDivElement>(null)

  const [data, setData] = useState<InvestigationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handlePrint = () => {
    window.print()
  }

  const handleDelete = async () => {
    if (!window.confirm("Delete this investigation? This cannot be undone.")) return
    try {
      await deleteInvestigation(investigationId)
      navigate("/detect", { replace: true })
    } catch (e: any) {
      setError(e.message)
    }
  }

  useEffect(() => {
    getInvestigationDetail(investigationId)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false))
  }, [investigationId])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl py-24 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
        <p className="mt-4 text-sm text-surface-400">Loading investigation report...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-4xl py-24 text-center">
        <h2 className="text-xl font-semibold text-surface-100">Investigation Not Found</h2>
        <p className="mt-2 text-sm text-surface-400">
          {error || "The investigation could not be loaded."}
        </p>
        <Link
          to="/detect"
          className="mt-6 inline-block rounded-[10px] bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-400"
        >
          Back to Detection
        </Link>
      </div>
    )
  }

  const headerMeta = [
    { label: "Image", value: `${data.image_width}\u00d7${data.image_height}` },
    { label: "Format", value: "PNG" },
    { label: "Size", value: data.file_size ? `${(data.file_size / 1024).toFixed(1)} KB` : "\u2014" },
  ]

  const summary = evidenceSummary(data)

  return (
    <div className="mx-auto max-w-4xl space-y-8" ref={reportRef}>
      <nav className="flex items-center gap-2 text-sm text-surface-400">
        <Link to="/" className="transition-colors hover:text-surface-200">
          Dashboard
        </Link>
        <span>/</span>
        <Link to="/detect" className="transition-colors hover:text-surface-200">
          Detect Leak
        </Link>
        <span>/</span>
        <span className="font-medium text-surface-300">{data.case_id ?? `INV-${String(data.id).padStart(3, "0")}`}</span>
      </nav>

      <div
        className={`rounded-[16px] border ${
          data.match_found
            ? "border-semantic-error/20 bg-semantic-error/5"
            : "border-surface-750 bg-surface-850"
        }`}
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-surface-100">
                {data.match_found ? "Match Confirmed" : "No Match Found"}
              </h1>
              <p className="mt-1 text-sm text-surface-400">
                {data.case_id ?? `INV-${String(data.id).padStart(3, "0")}`}
                {" \u00b7 "}
                {formatDate(data.created_at)}
              </p>
              {data.investigator && (
                <p className="mt-1 text-sm text-surface-400">
                  Investigator: <span className="font-medium text-surface-200">{data.investigator}</span>
                </p>
              )}
            </div>
            <div className="hidden sm:flex gap-3">
              {headerMeta.map((m) => (
                <div
                  key={m.label}
                  className="rounded-[10px] border border-surface-750 bg-surface-900 px-3 py-1.5 text-center"
                >
                  <p className="text-xs text-surface-500">{m.label}</p>
                  <p className="text-sm font-semibold text-surface-200">{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {data.match_found ? (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="rounded-[16px] border border-surface-750 bg-surface-850 p-6 lg:col-span-3">
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-surface-500">
              Suspected Source
            </h2>
            <div className="mt-4">
              <p className="text-lg font-semibold text-surface-100">{data.recipient_name}</p>
              {data.recipient_email && (
                <p className="mt-0.5 text-sm text-surface-400">{data.recipient_email}</p>
              )}
              <div className="mt-4 rounded-[12px] border border-surface-750 bg-surface-900 px-3.5 py-2.5">
                <p className="text-xs text-surface-500">Recovered Watermark ID</p>
                <p className="mt-0.5 font-mono text-sm font-medium text-brand-400">
                  {data.detected_watermark_id ?? "\u2014"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[16px] border border-surface-750 bg-surface-850 p-6 lg:col-span-2">
            <ConfidenceMeter value={data.confidence} possibleTampering={data.possible_tampering} />
          </div>
        </div>
      ) : (
        <div className="rounded-[16px] border border-surface-750 bg-surface-850 p-6">
          <ConfidenceMeter value={data.confidence} possibleTampering={false} />
        </div>
      )}

      {data.evidence_url && data.match_found && (
        <div className="rounded-[16px] border border-surface-750 bg-surface-850 p-6">
          <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-surface-500">
            Evidence Comparison
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="overflow-hidden rounded-[12px] border border-surface-750 bg-surface-900">
                {data.evidence_url ? (
                  <img
                    src={getApiUrl(data.evidence_url)}
                    alt="Leaked image evidence"
                    className="max-h-72 w-full object-contain"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                      target.parentElement?.classList.add("flex", "items-center", "justify-center", "p-8")
                      const fallback = document.createElement("div")
                      fallback.className = "text-center"
                      fallback.innerHTML = '<p class="text-sm text-surface-400">Evidence image unavailable</p>'
                      target.parentElement?.appendChild(fallback)
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center p-8">
                    <p className="text-sm text-surface-400">Evidence image unavailable</p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between px-1">
                <p className="text-xs text-surface-500 uppercase tracking-wider">Leaked Image</p>
                <p className="text-sm text-surface-400">
                  {data.image_width}&times;{data.image_height} &middot; {data.file_size ? `${(data.file_size / 1024).toFixed(1)} KB` : "\u2014"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex h-full items-center justify-center rounded-[12px] border border-surface-750 bg-surface-900 p-8">
                <div className="text-center">
                  <p className="text-sm font-medium text-surface-400">
                    {data.image_filename ?? "Original image"}
                  </p>
                  <p className="mt-1 text-sm text-surface-400">
                    {data.image_width}&times;{data.image_height} &middot; PNG
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-[16px] border border-surface-750 bg-surface-850 p-6">
        <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-surface-500">
          Investigation Timeline
        </h2>
        <div className="ml-1">
          <TimelineStep
            time={formatDate(data.image_created_at)}
            title="Image Uploaded"
            description={data.image_filename ? `"${data.image_filename}" was uploaded to the platform` : "Image was uploaded"}
            isLast={false}
          />
          <TimelineStep
            time={formatDate(data.watermark_created_at)}
            title="Watermarks Generated"
            description={
              data.recipient_name
                ? `Watermarked copy distributed to ${data.recipient_name}`
                : "Watermarked copies were generated"
            }
            isLast={false}
          />
          <TimelineStep
            time={formatDate(data.created_at)}
            title="Leak Detected"
            description={
              data.match_found
                ? `Leaked image analyzed \u2014 matched to ${data.recipient_name ?? "a known recipient"}`
                : "Leaked image analyzed \u2014 no match found"
            }
            isLast={false}
          />
          <TimelineStep
            time={formatDate(data.created_at)}
            title="Investigation Created"
            description={`${data.case_id ?? `INV-${String(data.id).padStart(3, "0")}`} was opened`}
            isLast={true}
          />
        </div>
      </div>

      <div className="rounded-[16px] border border-surface-750 bg-surface-850 p-6">
        <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-surface-500">
          Evidence Summary
        </h2>
        <p className="text-sm text-surface-200 leading-relaxed">{summary}</p>
        <div className="mt-4 flex gap-2 text-xs text-surface-400">
          <span>Case: {data.case_id ?? `INV-${String(data.id).padStart(3, "0")}`}</span>
          <span>&middot;</span>
          <span>Reported: {formatDate(data.created_at)}</span>
          {data.investigator && (
            <>
              <span>&middot;</span>
              <span>By: {data.investigator}</span>
            </>
          )}
        </div>
      </div>

      <div className="rounded-[16px] border border-surface-750 bg-surface-850 p-6">
        <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-surface-500">
          Technical Details
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "Watermark ID", value: data.detected_watermark_id ?? "\u2014", mono: true },
            { label: "Algorithm", value: "LSB (Least Significant Bit)" },
            { label: "Confidence", value: `${Math.round(data.confidence * 100)}%` },
            { label: "Tampering", value: data.possible_tampering ? "Detected" : "None detected" },
            { label: "Leaked File", value: data.leaked_filename },
            { label: "Dimensions", value: data.image_width && data.image_height ? `${data.image_width}\u00d7${data.image_height}` : "\u2014" },
            { label: "Investigator", value: data.investigator ?? "\u2014" },
          ].map((row) => (
            <div
              key={row.label}
              className="rounded-[10px] border border-surface-750 bg-surface-900 px-4 py-3"
            >
              <p className="text-xs text-surface-500">
                {row.label}
              </p>
              <p className={`mt-0.5 text-sm font-medium text-surface-200 ${row.mono ? "font-mono text-brand-400" : ""}`}>
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="no-print flex justify-center gap-4 pb-8 flex-wrap">
        <button
          onClick={handlePrint}
          className="rounded-[10px] bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-400"
        >
          Export PDF / Print
        </button>
        <Link
          to="/detect"
          className="rounded-[10px] bg-semantic-error px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-semantic-error/80"
        >
          New Investigation
        </Link>
        <Link
          to="/"
          className="rounded-[10px] border border-surface-750 px-5 py-2.5 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-850"
        >
          Dashboard
        </Link>
        <button
          onClick={handleDelete}
          className="rounded-[10px] border border-surface-750 px-5 py-2.5 text-sm font-medium text-surface-500 transition-colors hover:border-accent-leak/30 hover:text-accent-leak"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
