import { useState, useRef, useCallback, useEffect } from "react"
import { Link } from "react-router-dom"
import { detectLeak, listInvestigations } from "../api/detection"
import type { DetectionResult, Investigation } from "../types/detection"
import { ListItemSkeleton } from "../components/Skeleton"

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = pct >= 80 ? "bg-semantic-success" : pct >= 40 ? "bg-semantic-warning" : "bg-semantic-error"
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-700">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-14 text-right text-lg font-bold tabular-nums text-surface-100">
        {pct}%
      </span>
    </div>
  )
}

export default function DetectLeakPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [investigations, setInvestigations] = useState<Investigation[]>([])
  const [investigationsLoading, setInvestigationsLoading] = useState(true)
  const [investigationsErr, setInvestigationsErr] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInvestigationsLoading(true)
    listInvestigations()
      .then(setInvestigations)
      .catch(() => setInvestigationsErr(true))
      .finally(() => setInvestigationsLoading(false))
  }, [])

  const handleFile = useCallback((selected: File | null) => {
    if (!selected) return
    setFile(selected)
    setResult(null)
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(selected)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleFile(e.dataTransfer.files[0])
    },
    [handleFile],
  )

  const handleDetect = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const res = await detectLeak(file)
      setResult(res)
      const invs = await listInvestigations()
      setInvestigations(invs)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-100">Detect Leak Source</h1>
        <p className="mt-1 text-sm text-surface-400">
          Upload a suspected leaked image to identify who it came from
        </p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-[20px] border-2 border-dashed p-12 transition-colors ${
          dragOver
            ? "border-semantic-error bg-semantic-error/5"
            : "border-surface-700 bg-surface-800/50 hover:border-surface-600"
        }`}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="mb-4 max-h-64 rounded-[14px] object-contain" />
        ) : (
          <p className="text-sm font-medium text-surface-400">
            Drag and drop a suspected leaked image here
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        className="hidden"
      />

      {file && !result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-[14px] border border-surface-700 bg-surface-800 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-surface-200">{file.name}</p>
              <p className="text-sm text-surface-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={reset} className="text-sm text-surface-400 transition-colors hover:text-surface-200">Remove</button>
          </div>
          <button
            onClick={handleDetect}
            disabled={loading}
            className="w-full rounded-[14px] bg-semantic-error px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-semantic-error/80 disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze Leak"}
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-[14px] border border-semantic-error/20 bg-semantic-error/5 px-4 py-3 text-sm text-semantic-error">
          {error}
        </div>
      )}

      {result && (
        <div className={`rounded-[20px] border p-6 ${
          result.match_found
            ? "border-semantic-error/20 bg-semantic-error/5"
            : "border-surface-700 bg-surface-800"
        }`}>
          <div className="text-center">
            <h2 className="text-base font-semibold text-surface-100">
              {result.match_found ? "Match Found" : "No Match Found"}
            </h2>
          </div>

          {result.top_match && (
            <div className="mt-6 space-y-5">
              <div className="rounded-[14px] border border-surface-700 bg-surface-900 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">
                  Most Likely Source
                </p>
                <p className="mt-1.5 text-lg font-semibold text-surface-100">
                  {result.top_match.recipient_name}
                </p>
                <p className="mt-0.5 font-mono text-sm text-surface-400">
                  {result.top_match.watermark_id}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-surface-500">
                  Confidence
                </p>
                <ConfidenceBar value={result.confidence} />
              </div>

              {result.possible_tampering && (
                <div className="rounded-[14px] border border-semantic-warning/20 bg-semantic-warning/5 px-4 py-3 text-sm text-semantic-warning">
                  Possible tampering detected &mdash; the image may have been cropped or edited
                </div>
              )}
            </div>
          )}

          <div className="mt-6 text-sm text-surface-400">
            Image: {result.image_info.width}&times;{result.image_info.height} &middot; {result.image_info.format} &middot; {(result.image_info.file_size / 1024).toFixed(1)} KB
          </div>

          <div className="mt-6 flex justify-center gap-3">
            {result.investigation_id && (
              <Link
                to={`/investigations/${result.investigation_id}`}
                className="rounded-[14px] bg-semantic-error px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-semantic-error/80"
              >
                View Full Report
              </Link>
            )}
            <button
              onClick={reset}
              className="rounded-[14px] border border-surface-700 px-4 py-2.5 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800"
            >
              Analyze Another
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500">
          Investigation History
        </h2>
        {investigationsLoading ? (
          <div className="space-y-3">
            <ListItemSkeleton />
            <ListItemSkeleton />
            <ListItemSkeleton />
          </div>
        ) : investigationsErr ? (
          <div className="rounded-[14px] border border-semantic-error/20 bg-semantic-error/5 px-4 py-3 text-sm text-semantic-error">
            Failed to load investigation history.
          </div>
        ) : investigations.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm font-medium text-surface-400">No investigations yet</p>
            <p className="mt-1 text-sm text-surface-400">
              Run a leak detection above to see results here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {investigations.slice(0, 10).map((inv) => (
              <Link
                key={inv.id}
                to={`/investigations/${inv.id}`}
                className="flex items-center justify-between rounded-[14px] border border-surface-700 bg-surface-800 px-4 py-3 text-sm transition-colors hover:bg-surface-900"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-surface-200">{inv.leaked_filename}</p>
                  <p className="mt-0.5 text-sm text-surface-400">
                    {new Date(inv.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="ml-3 flex items-center gap-2">
                  <span
                    className={`rounded-[4px] px-1.5 py-0.5 text-[11px] font-semibold uppercase ${
                      inv.match_found
                        ? "bg-semantic-error/10 text-semantic-error"
                        : "bg-surface-900 text-surface-400"
                    }`}
                  >
                    {Math.round(inv.confidence * 100)}%
                  </span>
                  {inv.match_found && (
                    <span className="text-xs text-semantic-error">Match</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
