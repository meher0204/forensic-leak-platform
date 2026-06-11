import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { listRecipients } from "../api/recipients"
import { generateWatermarks, listCopies } from "../api/images"
import type { Recipient, WatermarkedCopy } from "../types/recipient"
import { apiRequest, getApiUrl } from "../api/client"
import type { Image } from "../types/image"

export default function GenerateWatermarksPage() {
  const { imageId } = useParams<{ imageId: string }>()
  const id = Number(imageId)

  const [image, setImage] = useState<Image | null>(null)
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [copies, setCopies] = useState<WatermarkedCopy[]>([])
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiRequest<Image>(`/images/${id}`).then(setImage).catch(() => {})
    listRecipients().then(setRecipients).catch(() => {})
    listCopies(id).then((existing) => {
      setCopies(existing)
      if (existing.length > 0) setDone(true)
    }).catch(() => {})
  }, [id])

  const toggle = (rid: number) => {
    const next = new Set(selected)
    if (next.has(rid)) next.delete(rid)
    else next.add(rid)
    setSelected(next)
  }

  const selectAll = () => setSelected(new Set(recipients.map((r) => r.id)))
  const deselectAll = () => setSelected(new Set())

  const handleGenerate = async () => {
    if (selected.size === 0) return
    setGenerating(true)
    setError(null)
    try {
      const result = await generateWatermarks(id, [...selected])
      setCopies(result)
      setDone(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <nav className="mb-4 flex items-center gap-2 text-sm text-surface-500">
          <Link to="/" className="transition-colors hover:text-surface-300">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-surface-400">Watermark</span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight text-surface-100">
          Generate Watermarked Copies
        </h1>
        <p className="mt-1 text-sm text-surface-500">
          Select recipients to create uniquely watermarked copies
        </p>
      </div>

      {image && (
        <div className="rounded-xl border border-surface-800 bg-surface-900/50 p-4">
          <p className="text-sm text-surface-500">
            Image:{" "}
            <span className="font-medium text-surface-200">{image.original_filename}</span>
            {" · "}
            {(image.file_size / 1024).toFixed(1)} KB
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-semantic-error/20 bg-semantic-error/5 px-4 py-3 text-sm text-semantic-error">
          {error}
        </div>
      )}

      {!done && (
        <>
          <div className="rounded-xl border border-surface-800 bg-surface-900/50 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-surface-400">
                Select Recipients ({recipients.length} available)
              </h2>
              <div className="flex gap-3 text-xs">
                <button
                  onClick={selectAll}
                  className="font-medium text-brand-400 transition-colors hover:text-brand-300"
                >
                  Select All
                </button>
                <span className="text-surface-700">·</span>
                <button
                  onClick={deselectAll}
                  className="text-surface-500 transition-colors hover:text-surface-300"
                >
                  Clear
                </button>
              </div>
            </div>

            {recipients.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <p className="text-sm text-surface-500">No recipients found.</p>
                <Link
                  to="/recipients"
                  className="mt-2 text-sm font-medium text-brand-400 transition-colors hover:text-brand-300"
                >
                  Add recipients first →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recipients.map((r) => (
                  <label
                    key={r.id}
                    onClick={() => toggle(r.id)}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3.5 transition-all ${
                      selected.has(r.id)
                        ? "border-brand-500/40 bg-brand-500/5"
                        : "border-surface-800 hover:border-surface-700 hover:bg-surface-800/30"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                        selected.has(r.id)
                          ? "border-brand-500 bg-brand-500"
                          : "border-surface-600"
                      }`}
                    >
                      {selected.has(r.id) && (
                        <span className="text-[10px] font-bold text-white">✓</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-200">{r.name}</p>
                      <p className="text-xs text-surface-500">{r.email}</p>
                    </div>
                    {selected.has(r.id) && (
                      <span className="ml-auto text-xs font-medium text-brand-400">
                        selected
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || selected.size === 0}
            className="w-full rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating
              ? `Generating ${selected.size} copies...`
               : `🔒 Generate ${selected.size} Watermarked ${selected.size !== 1 ? "Copies" : "Copy"}`}
          </button>
        </>
      )}

      {done && (
        <>
          <div className="rounded-xl border border-semantic-success/20 bg-gradient-to-br from-semantic-success/5 to-transparent p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-semantic-success/10 text-3xl">
              ✓
            </div>
            <h2 className="mt-4 text-lg font-semibold text-surface-100">
              {copies.length} Watermarked Cop{copies.length === 1 ? "y" : "ies"} Generated
            </h2>
            <p className="mt-1.5 text-sm text-surface-400">
              Each copy has a unique forensic watermark. Download and distribute.
            </p>
          </div>

          <div className="space-y-2">
            {copies.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-surface-800 bg-surface-900/50 px-5 py-4 transition-all hover:border-surface-700"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 text-lg">🖼</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-surface-200">
                      {c.recipient_name}
                    </p>
                    <p className="truncate font-mono text-xs text-surface-500">
                      {c.watermark_id}
                    </p>
                  </div>
                </div>
                <a
                  href={getApiUrl(`/api/images/copies/${c.id}/download`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-400"
                >
                  Download
                </a>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3">
            <Link
              to="/"
              className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-400"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/upload"
              className="rounded-lg border border-surface-700 px-5 py-2.5 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800"
            >
              Upload Another Image
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
