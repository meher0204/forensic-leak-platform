import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { listImages } from "../api/images"
import { listRecipients } from "../api/recipients"
import { listInvestigations } from "../api/detection"
import { resetDemoData } from "../api/admin"
import { useToast } from "../components/Toast"
import type { Image } from "../types/image"
import type { Recipient } from "../types/recipient"
import type { Investigation } from "../types/detection"
import StatCard from "../components/StatCard"
import { StatCardSkeleton, ListItemSkeleton } from "../components/Skeleton"

export default function Dashboard() {
  const [images, setImages] = useState<Image[]>([])
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [investigations, setInvestigations] = useState<Investigation[]>([])
  const [loading, setLoading] = useState(true)
  const [imagesErr, setImagesErr] = useState(false)
  const [invsErr, setInvsErr] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [activeTab, setActiveTab] = useState<"uploads" | "investigations">("uploads")
  const { toast } = useToast()

  const loadAll = useCallback(() => {
    setLoading(true)
    setImagesErr(false)
    setInvsErr(false)
    Promise.allSettled([
      listImages().then(setImages).catch((e) => { setImagesErr(true); console.error("Images fetch failed:", e) }),
      listRecipients().then(setRecipients).catch((e) => console.error("Recipients fetch failed:", e)),
      listInvestigations().then(setInvestigations).catch((e) => { setInvsErr(true); console.error("Investigations fetch failed:", e) }),
    ]).finally(() => setLoading(false))
  }, [])

  useEffect(loadAll, [loadAll])

  const handleReset = async () => {
    setResetting(true)
    try {
      await resetDemoData()
      toast("Demo data reset successfully", "success")
      setShowResetModal(false)
      loadAll()
    } catch {
      toast("Failed to reset demo data", "error")
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-surface-400">
            Overview of your forensic watermarking activity
          </p>
        </div>
          <button
            onClick={() => setShowResetModal(true)}
            className="rounded-[14px] border border-surface-700 px-3.5 py-1.5 text-xs font-medium text-surface-400 transition-all duration-150 hover:border-semantic-error/30 hover:text-semantic-error"
          >
          Reset Demo Data
        </button>
      </div>

      <div className="animate-fade-in-up grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard label="Images" value={images.length} />
            <StatCard label="Recipients" value={recipients.length} />
            <StatCard label="Investigations" value={investigations.length} />
            <StatCard
              label="Leaks Matched"
              value={investigations.filter((i) => i.match_found).length}
            />
          </>
        )}
      </div>

      {/* ── Recent Activity ── */}
      <div className="animate-fade-in-up rounded-[20px] border border-surface-700 bg-surface-800" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center justify-between border-b border-surface-700 px-5 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500">
            Recent Activity
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex gap-1 rounded-[10px] bg-surface-900 p-0.5">
              <button
                onClick={() => setActiveTab("uploads")}
                className={`rounded-[8px] px-3 py-1 text-xs font-medium transition-all duration-150 ${
                  activeTab === "uploads"
                    ? "bg-brand-500/10 text-brand-400"
                    : "text-surface-400 hover:text-surface-200"
                }`}
              >
                Uploads
              </button>
              <button
                onClick={() => setActiveTab("investigations")}
                className={`rounded-[8px] px-3 py-1 text-xs font-medium transition-all duration-150 ${
                  activeTab === "investigations"
                    ? "bg-brand-500/10 text-brand-400"
                    : "text-surface-400 hover:text-surface-200"
                }`}
              >
                Investigations
              </button>
            </div>
            <Link
              to={activeTab === "uploads" ? "/upload" : "/detect"}
              className="text-xs font-medium text-brand-400 transition-colors hover:text-brand-300"
            >
              View all
            </Link>
          </div>
        </div>

        {/* ── Uploads Tab ── */}
        {activeTab === "uploads" && (
          <div className="px-5 py-4">
            {loading && (
              <div className="space-y-3">
                <ListItemSkeleton />
                <ListItemSkeleton />
                <ListItemSkeleton />
              </div>
            )}

            {imagesErr && !loading && (
              <div className="rounded-[14px] border border-semantic-error/20 bg-semantic-error/5 px-4 py-3 text-sm text-semantic-error">
                Failed to load images.
                <button
                  onClick={() => {
                    setImagesErr(false)
                    setLoading(true)
                    listImages()
                      .then(setImages)
                      .catch(() => setImagesErr(true))
                      .finally(() => setLoading(false))
                  }}
                  className="ml-2 underline transition-colors hover:text-semantic-error/80"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !imagesErr && images.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-sm font-medium text-surface-400">No images yet</p>
                <p className="mt-1 text-sm text-surface-400">
                  Upload an image to start creating watermarked copies
                </p>
                <Link
                  to="/upload"
                  className="mt-5 inline-block rounded-[14px] bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.02] hover:bg-brand-400"
                >
                  Upload Image
                </Link>
              </div>
            )}

            {!loading && images.length > 0 && (
              <ul className="space-y-2">
                {images.slice(0, 5).map((img) => (
                  <li key={img.id}>
                    <Link
                      to={`/images/${img.id}/watermark`}
                      className="flex items-center justify-between rounded-[14px] border border-surface-700 bg-surface-900 px-4 py-3 text-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-surface-600"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-surface-200">
                          {img.original_filename}
                        </p>
                        <p className="mt-0.5 text-sm text-surface-400">
                          {new Date(img.created_at).toLocaleString()} &middot; {(img.file_size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <span className="ml-3 shrink-0 text-xs text-surface-400">
                        {img.mime_type.split("/")[1].toUpperCase()}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ── Investigations Tab ── */}
        {activeTab === "investigations" && (
          <div className="px-5 py-4">
            {loading ? (
              <div className="space-y-3">
                <ListItemSkeleton />
                <ListItemSkeleton />
                <ListItemSkeleton />
              </div>
            ) : invsErr ? (
              <div className="rounded-[14px] border border-semantic-error/20 bg-semantic-error/5 px-4 py-3 text-sm text-semantic-error">
                Failed to load investigations.
              </div>
            ) : investigations.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm font-medium text-surface-400">No investigations yet</p>
                <p className="mt-1 text-sm text-surface-400">
                  Run a leak detection to see results here
                </p>
                <Link
                  to="/detect"
                  className="mt-4 inline-block rounded-[14px] bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-400"
                >
                  Detect a Leak
                </Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {investigations.slice(0, 5).map((inv) => (
                  <li key={inv.id}>
                    <Link
                      to={`/investigations/${inv.id}`}
                      className="flex items-center justify-between rounded-[14px] border border-surface-700 bg-surface-900 px-4 py-3 text-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-surface-600"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-surface-200">
                          {inv.leaked_filename}
                        </p>
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
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-sm rounded-[20px] border border-surface-700 bg-surface-800 p-6">
            <h2 className="text-base font-semibold text-surface-100">
              Reset Demo Data?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-surface-400">
              This will permanently delete all images, recipients, watermarked copies,
              and investigations. User accounts and sessions will be preserved.
            </p>
            <p className="mt-2 text-sm font-medium text-semantic-error">
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                disabled={resetting}
                className="rounded-[14px] border border-surface-700 px-4 py-2 text-sm text-surface-300 transition-colors hover:bg-surface-900 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="rounded-[14px] bg-semantic-error px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-semantic-error/80 disabled:opacity-50"
              >
                {resetting ? "Resetting..." : "Reset Everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
