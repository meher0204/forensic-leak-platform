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
  const { toast } = useToast()

  const latestMatches = investigations.filter((i) => i.match_found).slice(0, 4)
  const recentImages = images.slice(0, 5)
  const recentInvestigations = investigations.slice(0, 5)

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
    <div className="mx-auto max-w-6xl space-y-10">
      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-surface-100">Dashboard</h1>
          <p className="mt-1 text-sm text-surface-400">
            Overview of your forensic watermarking activity
          </p>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <section className="animate-fade-in-up">
        <div className="mb-4 flex items-center gap-3">
          <span className="h-4 w-1 rounded-full bg-brand-500" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-400">
            Quick Actions
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            to="/upload"
            className="group relative overflow-hidden rounded-[16px] border border-surface-750 bg-surface-850 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/[0.04]"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand-500/10 transition-colors group-hover:bg-brand-500/15">
              <svg className="h-5 w-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-surface-100">Upload Image</p>
            <p className="mt-1 text-xs text-surface-400">
              Add a new image for watermarking
            </p>
          </Link>
          <Link
            to="/recipients"
            className="group relative overflow-hidden rounded-[16px] border border-surface-750 bg-surface-850 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-recipient/30 hover:shadow-lg hover:shadow-accent-recipient/[0.04]"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent-recipient/10 transition-colors group-hover:bg-accent-recipient/15">
              <svg className="h-5 w-5 text-accent-recipient" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-surface-100">Add Recipient</p>
            <p className="mt-1 text-xs text-surface-400">
              Manage who receives watermarked copies
            </p>
          </Link>
          <Link
            to="/detect"
            className="group relative overflow-hidden rounded-[16px] border border-surface-750 bg-surface-850 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-investigation/30 hover:shadow-lg hover:shadow-accent-investigation/[0.04]"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent-investigation/10 transition-colors group-hover:bg-accent-investigation/15">
              <svg className="h-5 w-5 text-accent-investigation" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-surface-100">Start Investigation</p>
            <p className="mt-1 text-xs text-surface-400">
              Upload a suspected leak for analysis
            </p>
          </Link>
        </div>
      </section>

      {/* ── Stat Cards ── */}
      <section className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
        <div className="mb-4 flex items-center gap-3">
          <span className="h-4 w-1 rounded-full bg-brand-500" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-400">
            Overview
          </h2>
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Images" value={images.length} variant="image" />
            <StatCard label="Recipients" value={recipients.length} variant="recipient" />
            <StatCard label="Investigations" value={investigations.length} variant="investigation" />
            <StatCard label="Leaks Matched" value={investigations.filter((i) => i.match_found).length} variant="leak" />
          </div>
        )}
      </section>

      {/* ── Two-column: Recent Activity + Latest Matches ── */}
      <div className="animate-fade-in-up grid gap-6 lg:grid-cols-5" style={{ animationDelay: "0.1s" }}>
        {/* Recent Activity (3/5) */}
        <div className="rounded-[16px] border border-surface-750 bg-surface-850 lg:col-span-3">
          <div className="flex items-center justify-between border-b border-surface-750 px-5 py-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-400">
              Recent Activity
            </h3>
            <div className="flex items-center gap-1">
              <Link
                to="/upload"
                className="rounded-[8px] px-3 py-1 text-xs font-medium text-surface-400 transition-colors hover:text-surface-200"
              >
                Uploads
              </Link>
              <span className="text-surface-600">{images.length}</span>
              <span className="mx-2 text-surface-600">&middot;</span>
              <Link
                to="/detect"
                className="rounded-[8px] px-3 py-1 text-xs font-medium text-surface-400 transition-colors hover:text-surface-200"
              >
                Investigations
              </Link>
              <span className="text-surface-600">{investigations.length}</span>
            </div>
          </div>

          <div className="divide-y divide-surface-750">
            {/* Recent Uploads */}
            <div className="px-5 py-4">
              <p className="mb-3 text-xs font-medium text-surface-500">Uploads</p>
              {loading ? (
                <div className="space-y-2">
                  <ListItemSkeleton />
                  <ListItemSkeleton />
                </div>
              ) : imagesErr ? (
                <div className="rounded-[10px] border border-semantic-error/15 bg-semantic-error/5 px-3.5 py-2.5 text-xs text-semantic-error">
                  Failed to load images.
                </div>
              ) : recentImages.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-sm text-surface-400">No images yet</p>
                  <Link
                    to="/upload"
                    className="mt-3 inline-block rounded-[10px] bg-brand-500 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-brand-400"
                  >
                    Upload Image
                  </Link>
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {recentImages.map((img) => (
                    <li key={img.id}>
                      <Link
                        to={`/images/${img.id}/watermark`}
                        className="flex items-center justify-between rounded-[10px] border border-surface-750 bg-surface-900/60 px-3.5 py-2.5 text-sm transition-all duration-150 hover:bg-surface-900"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-surface-200">{img.original_filename}</p>
                          <p className="mt-0.5 text-xs text-surface-400">
                            {new Date(img.created_at).toLocaleDateString()} &middot; {(img.file_size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <span className="ml-3 shrink-0 rounded-[4px] border border-accent-image/20 bg-accent-image/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-image">
                          {img.mime_type.split("/")[1]}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent Investigations */}
            <div className="px-5 py-4">
              <p className="mb-3 text-xs font-medium text-surface-500">Investigations</p>
              {loading ? (
                <div className="space-y-2">
                  <ListItemSkeleton />
                  <ListItemSkeleton />
                </div>
              ) : invsErr ? (
                <div className="rounded-[10px] border border-semantic-error/15 bg-semantic-error/5 px-3.5 py-2.5 text-xs text-semantic-error">
                  Failed to load investigations.
                </div>
              ) : recentInvestigations.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-sm text-surface-400">No investigations yet</p>
                  <Link
                    to="/detect"
                    className="mt-3 inline-block rounded-[10px] bg-brand-500 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-brand-400"
                  >
                    Detect a Leak
                  </Link>
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {recentInvestigations.map((inv) => (
                    <li key={inv.id}>
                      <Link
                        to={`/investigations/${inv.id}`}
                        className="flex items-center justify-between rounded-[10px] border border-surface-750 bg-surface-900/60 px-3.5 py-2.5 text-sm transition-all duration-150 hover:bg-surface-900"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-surface-200">{inv.leaked_filename}</p>
                          <p className="mt-0.5 text-xs text-surface-400">
                            {new Date(inv.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-3 flex items-center gap-2">
                          <span
                            className={`rounded-[4px] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              inv.match_found
                                ? "bg-accent-leak/10 text-accent-leak"
                                : "bg-surface-800 text-surface-400"
                            }`}
                          >
                            {Math.round(inv.confidence * 100)}%
                          </span>
                          {inv.match_found && (
                            <span className="rounded-[4px] bg-accent-leak/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-leak">
                              Match
                            </span>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Latest Matches (2/5) */}
        <div className="rounded-[16px] border border-surface-750 bg-surface-850 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-surface-750 px-5 py-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-400">
              Latest Matches
            </h3>
            {latestMatches.length > 0 && (
              <span className="rounded-[6px] bg-accent-leak/10 px-2 py-0.5 text-[10px] font-semibold text-accent-leak">
                {latestMatches.length}
              </span>
            )}
          </div>
          <div className="px-5 py-4">
            {loading ? (
              <div className="space-y-2">
                <ListItemSkeleton />
                <ListItemSkeleton />
              </div>
            ) : latestMatches.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] bg-surface-800">
                  <svg className="h-5 w-5 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-surface-400">No leaks matched yet</p>
                <p className="mt-1 text-xs text-surface-500">
                  Matched investigations appear here
                </p>
              </div>
            ) : (
              <ul className="space-y-1.5">
                {latestMatches.map((inv) => (
                  <li key={inv.id}>
                    <Link
                      to={`/investigations/${inv.id}`}
                      className="flex items-center justify-between rounded-[10px] border border-surface-750 bg-surface-900/60 px-3.5 py-2.5 text-sm transition-all duration-150 hover:bg-surface-900"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-surface-200">{inv.leaked_filename}</p>
                        <p className="mt-0.5 text-xs text-surface-400">
                          {Math.round(inv.confidence * 100)}% confidence
                        </p>
                      </div>
                      <span className="ml-3 shrink-0 rounded-[4px] bg-accent-leak/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-leak">
                        Match
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between border-t border-surface-750 pt-6">
        <p className="text-xs text-surface-500">
          {images.length + recipients.length + investigations.length} total records
        </p>
        <button
          onClick={() => setShowResetModal(true)}
          className="rounded-[8px] border border-surface-750 px-3 py-1.5 text-[11px] font-medium text-surface-500 transition-all duration-150 hover:border-surface-600 hover:text-surface-400"
        >
          Reset Demo Data
        </button>
      </div>

      {/* Reset confirmation modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-sm rounded-[16px] border border-surface-750 bg-surface-900 p-6 shadow-xl">
            <h2 className="text-base font-semibold text-surface-100">Reset Demo Data?</h2>
            <p className="mt-2 text-sm leading-relaxed text-surface-400">
              This will permanently delete all images, recipients, watermarked copies, and investigations. User accounts and sessions will be preserved.
            </p>
            <p className="mt-2 text-sm font-medium text-accent-leak">
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                disabled={resetting}
                className="rounded-[10px] border border-surface-700 px-4 py-2 text-sm text-surface-300 transition-colors hover:bg-surface-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="rounded-[10px] bg-accent-leak px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-leak/80 disabled:opacity-50"
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
