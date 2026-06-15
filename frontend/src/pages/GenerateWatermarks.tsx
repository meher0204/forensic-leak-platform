import { useEffect, useState, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import { listRecipients } from "../api/recipients"
import { generateWatermarks, listCopies } from "../api/images"
import type { Recipient, WatermarkedCopy } from "../types/recipient"
import { apiRequest, getApiUrl } from "../api/client"
import type { Image } from "../types/image"
import { ListItemSkeleton } from "../components/Skeleton"

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
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  const loadPage = useCallback(() => {
    setPageLoading(true)
    setPageError(null)
    Promise.all([
      apiRequest<Image>(`/images/${id}`).then(setImage),
      listRecipients().then(setRecipients),
      listCopies(id).then((existing) => {
        setCopies(existing)
        if (existing.length > 0) setDone(true)
      }),
    ]).catch((e) => {
      setPageError(e.message || "Failed to load page data")
    }).finally(() => setPageLoading(false))
  }, [id])

  useEffect(loadPage, [loadPage])

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
        <nav className="mb-4 flex items-center gap-2 text-sm text-surface-400">
          <Link to="/" className="transition-colors hover:text-surface-200">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-surface-400">Watermark</span>
        </nav>
        <h1 className="text-2xl font-bold text-surface-100">
          Generate Watermarked Copies
        </h1>
        <p className="mt-1 text-sm text-surface-400">
          Select recipients to create uniquely watermarked copies
        </p>
      </div>

      {pageLoading ? (
        <div className="space-y-3">
          <ListItemSkeleton />
          <ListItemSkeleton />
          <ListItemSkeleton />
        </div>
      ) : pageError ? (
        <div className="rounded-[12px] border border-semantic-error/15 bg-semantic-error/5 px-4 py-3 text-sm text-semantic-error">
          {pageError}
        </div>
      ) : (
        <div className="contents">
          {image && (
            <div className="rounded-[12px] border border-surface-750 bg-surface-850 px-5 py-4">
              <p className="text-sm text-surface-400">
                Image: <span className="font-medium text-surface-200">{image.original_filename}</span>
                &middot; {(image.file_size / 1024).toFixed(1)} KB
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-[12px] border border-semantic-error/15 bg-semantic-error/5 px-4 py-3 text-sm text-semantic-error">
              {error}
              <button onClick={loadPage} className="ml-3 underline hover:no-underline text-surface-200">Retry</button>
            </div>
          )}

          {!done && (
        <>
          <div className="rounded-[16px] border border-surface-750 bg-surface-850 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500">
                Select Recipients ({recipients.length} available)
              </h2>
              <div className="flex gap-3 text-sm">
                <button
                  onClick={selectAll}
                  className="font-medium text-brand-400 transition-colors hover:text-brand-300"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAll}
                  className="text-surface-400 transition-colors hover:text-surface-200"
                >
                  Clear
                </button>
              </div>
            </div>

            {recipients.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-surface-400">No recipients found.</p>
                <Link
                  to="/recipients"
                  className="mt-2 inline-block text-sm font-medium text-brand-400 transition-colors hover:text-brand-300"
                >
                  Add recipients first
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recipients.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => toggle(r.id)}
                    className={`flex cursor-pointer items-center gap-4 rounded-[12px] border px-4 py-3.5 transition-colors ${
                      selected.has(r.id)
                        ? "border-brand-500/40 bg-brand-500/5"
                        : "border-surface-750 hover:bg-surface-900"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                        selected.has(r.id)
                          ? "border-brand-500 bg-brand-500"
                          : "border-surface-600"
                      }`}
                    >
                      {selected.has(r.id) && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white">
                          <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-200">{r.name}</p>
                      <p className="text-sm text-surface-400">{r.email}</p>
                    </div>
                    {selected.has(r.id) && (
                      <span className="ml-auto text-xs font-medium text-brand-400">
                        selected
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || selected.size === 0}
            className="w-full rounded-[12px] bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating
              ? `Generating ${selected.size} copies...`
              : `Generate ${selected.size} Watermarked ${selected.size !== 1 ? "Copies" : "Copy"}`}
          </button>
        </>
      )}

      {done && (
        <>
          <div className="rounded-[16px] border border-semantic-success/20 bg-semantic-success/5 p-8 text-center">
            <h2 className="text-base font-semibold text-surface-100">
              {copies.length} Watermarked Cop{copies.length === 1 ? "y" : "ies"} Generated
            </h2>
            <p className="mt-1 text-sm text-surface-400">
              Each copy has a unique forensic watermark. Download and distribute.
            </p>
          </div>

          <div className="space-y-2">
            {copies.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-[12px] border border-surface-750 bg-surface-850 px-4 py-3 transition-colors hover:bg-surface-900"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-surface-200">
                    {c.recipient_name}
                  </p>
                  <p className="font-mono text-sm text-surface-400">
                    {c.watermark_id}
                  </p>
                </div>
                <a
                  href={getApiUrl(`/api/images/copies/${c.id}/download`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-[10px] bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-400"
                >
                  Download
                </a>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3">
            <Link
              to="/"
              className="rounded-[10px] bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-400"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/upload"
              className="rounded-[10px] border border-surface-750 px-5 py-2.5 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-850"
            >
              Upload Another Image
            </Link>
          </div>
        </>
      )}
        </div>
      )}
    </div>
  )
}
