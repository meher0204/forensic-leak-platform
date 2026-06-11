import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { getInvestigationDetail } from "../api/detection"
import { getApiUrl } from "../api/client"
import type { InvestigationDetail } from "../types/detection"

function formatDate(d: string | null | undefined): string {
  if (!d) return "—"
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
        <span className="text-xs font-medium uppercase tracking-wider text-surface-500">
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
                : "bg-surface-800"
            }`}
          />
        ))}
      </div>
      {possibleTampering && (
        <div className="flex items-center gap-2 rounded-lg border border-semantic-warning/20 bg-semantic-warning/5 px-3 py-2.5 text-xs text-semantic-warning">
          <span>⚠</span>
          <span>Possible tampering detected — image may have been cropped or edited</span>
        </div>
      )}
    </div>
  )
}

function TimelineStep({
  icon,
  time,
  title,
  description,
  isLast,
}: {
  icon: string
  time: string
  title: string
  description: string
  isLast: boolean
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-surface-700 bg-surface-900 text-sm">
          {icon}
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-surface-800" />}
      </div>
      <div className={`pb-7 ${isLast ? "" : ""}`}>
        <p className="text-xs font-medium text-surface-500">{time}</p>
        <p className="mt-0.5 text-sm font-semibold text-surface-200">{title}</p>
        <p className="mt-0.5 text-xs text-surface-500 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

export default function InvestigationReport() {
  const { id } = useParams<{ id: string }>()
  const investigationId = Number(id)

  const [data, setData] = useState<InvestigationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getInvestigationDetail(investigationId)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false))
  }, [investigationId])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl py-24 text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
        <p className="mt-5 text-sm text-surface-500">Loading investigation report...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-4xl py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-800 text-3xl">
          🔍
        </div>
        <h2 className="mt-5 text-xl font-semibold text-surface-100">Investigation Not Found</h2>
        <p className="mt-2 text-sm text-surface-500">
          {error || "The investigation could not be loaded."}
        </p>
        <Link
          to="/detect"
          className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-400"
        >
          ← Back to Detection
        </Link>
      </div>
    )
  }

  const headerMeta = [
    { label: "Image", value: `${data.image_width}×${data.image_height}` },
    { label: "Format", value: "PNG" },
    { label: "Size", value: data.file_size ? `${(data.file_size / 1024).toFixed(1)} KB` : "—" },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-surface-500">
        <Link to="/" className="transition-colors hover:text-surface-300">
          Dashboard
        </Link>
        <span>/</span>
        <Link to="/detect" className="transition-colors hover:text-surface-300">
          Detect Leak
        </Link>
        <span>/</span>
        <span className="font-medium text-surface-300">INV-{String(data.id).padStart(3, "0")}</span>
      </nav>

      {/* Status Banner */}
      <div
        className={`overflow-hidden rounded-xl border ${
          data.match_found
            ? "border-semantic-error/20 bg-gradient-to-r from-semantic-error/5 to-transparent"
            : "border-surface-700 bg-surface-900/50"
        }`}
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                  data.match_found
                    ? "bg-semantic-error/10"
                    : "bg-surface-800"
                }`}
              >
                {data.match_found ? "⚠️" : "❌"}
              </div>
              <div>
                <h1 className="text-xl font-bold text-surface-100">
                  {data.match_found ? "Match Confirmed" : "No Match Found"}
                </h1>
                <p className="mt-1 text-sm text-surface-400">
                  Investigation #{String(data.id).padStart(3, "0")}
                  {" · "}
                  {formatDate(data.created_at)}
                </p>
              </div>
            </div>
            <div className="hidden sm:flex gap-2">
              {headerMeta.map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg border border-surface-800 bg-surface-950/50 px-3 py-1.5 text-center"
                >
                  <p className="text-[11px] font-medium uppercase tracking-wider text-surface-500">
                    {m.label}
                  </p>
                  <p className="text-sm font-semibold text-surface-200">{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Suspected Source + Confidence */}
      {data.match_found ? (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="rounded-xl border border-surface-800 bg-surface-900/50 p-6 lg:col-span-3">
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-surface-500">
              Suspected Source
            </h2>
            <div className="mt-4 flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-semantic-error/10 text-xl font-bold text-semantic-error">
                {data.recipient_name?.charAt(0) ?? "?"}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-surface-100">{data.recipient_name}</p>
                {data.recipient_email && (
                  <p className="mt-0.5 text-sm text-surface-400">{data.recipient_email}</p>
                )}
                <div className="mt-4 rounded-lg border border-surface-800 bg-surface-950/50 px-3.5 py-2.5">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-surface-500">
                    Recovered Watermark ID
                  </p>
                  <p className="mt-0.5 font-mono text-sm font-medium text-brand-400">
                    {data.detected_watermark_id ?? "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-surface-800 bg-surface-900/50 p-6 lg:col-span-2">
            <ConfidenceMeter value={data.confidence} possibleTampering={data.possible_tampering} />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-surface-800 bg-surface-900/50 p-6">
          <ConfidenceMeter value={data.confidence} possibleTampering={false} />
        </div>
      )}

      {/* Evidence Comparison */}
      {data.evidence_url && data.match_found && (
        <div className="rounded-xl border border-surface-800 bg-surface-900/50 p-6">
          <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-surface-500">
            Evidence Comparison
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="overflow-hidden rounded-lg border border-surface-800 bg-surface-950/50">
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
                      fallback.innerHTML = '<div class="text-3xl text-surface-700">🖼</div><p class="mt-2 text-sm text-surface-500">Evidence image unavailable</p>'
                      target.parentElement?.appendChild(fallback)
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="text-3xl text-surface-700">🖼</div>
                      <p className="mt-2 text-sm text-surface-500">Evidence image unavailable</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-medium text-surface-400">Leaked Image</p>
                <p className="text-xs text-surface-600">
                  {data.image_width}×{data.image_height} · {data.file_size ? `${(data.file_size / 1024).toFixed(1)} KB` : "—"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex h-full items-center justify-center overflow-hidden rounded-lg border border-surface-800 bg-surface-950/50 p-8">
                <div className="text-center">
                  <div className="text-3xl text-surface-700">🖼</div>
                  <p className="mt-3 text-sm font-medium text-surface-400">
                    {data.image_filename ?? "Original image"}
                  </p>
                  <p className="mt-1 text-xs text-surface-600">
                    {data.image_width}×{data.image_height} · PNG
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Investigation Timeline */}
      <div className="rounded-xl border border-surface-800 bg-surface-900/50 p-6">
        <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-surface-500">
          Investigation Timeline
        </h2>
        <div className="ml-1">
          <TimelineStep
            icon="📤"
            time={formatDate(data.image_created_at)}
            title="Image Uploaded"
            description={data.image_filename ? `"${data.image_filename}" was uploaded to the platform` : "Image was uploaded"}
            isLast={false}
          />
          <TimelineStep
            icon="🔒"
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
            icon="🔍"
            time={formatDate(data.created_at)}
            title="Leak Detected"
            description={
              data.match_found
                ? `Leaked image analyzed — matched to ${data.recipient_name ?? "a known recipient"}`
                : "Leaked image analyzed — no match found"
            }
            isLast={false}
          />
          <TimelineStep
            icon="📋"
            time={formatDate(data.created_at)}
            title="Investigation Created"
            description={`Investigation #${String(data.id).padStart(3, "0")} was opened`}
            isLast={true}
          />
        </div>
      </div>

      {/* Technical Details */}
      <div className="rounded-xl border border-surface-800 bg-surface-900/50 p-6">
        <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-surface-500">
          Technical Details
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "Watermark ID", value: data.detected_watermark_id ?? "—", mono: true },
            { label: "Algorithm", value: "LSB (Least Significant Bit)" },
            { label: "Confidence", value: `${Math.round(data.confidence * 100)}%` },
            { label: "Tampering", value: data.possible_tampering ? "⚠ Detected" : "None detected" },
            { label: "Leaked File", value: data.leaked_filename },
            { label: "Dimensions", value: data.image_width && data.image_height ? `${data.image_width}×${data.image_height}` : "—" },
          ].map((row) => (
            <div
              key={row.label}
              className="rounded-lg border border-surface-800 bg-surface-950/30 px-4 py-3"
            >
              <p className="text-[11px] font-medium uppercase tracking-wider text-surface-500">
                {row.label}
              </p>
              <p className={`mt-0.5 text-sm font-medium text-surface-200 ${row.mono ? "font-mono text-brand-400" : ""}`}>
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4 pb-8">
        <Link
          to="/detect"
          className="inline-flex items-center gap-1.5 rounded-lg bg-semantic-error px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-semantic-error/80"
        >
          New Investigation
        </Link>
        <Link
          to="/"
          className="rounded-lg border border-surface-700 px-5 py-2.5 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800"
        >
          Dashboard
        </Link>
      </div>
    </div>
  )
}
