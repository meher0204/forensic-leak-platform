import { useEffect, useState } from "react"
import { getAdminOverview } from "../api/admin"
import type { AdminOverview } from "../api/admin"

export default function AdminPage() {
  const [data, setData] = useState<AdminOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAdminOverview()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const stats = data
    ? [
        { label: "Users", value: data.total_users },
        { label: "Images", value: data.total_images },
        { label: "Recipients", value: data.total_recipients },
        { label: "Watermarked Copies", value: data.total_watermarked_copies },
        { label: "Investigations", value: data.total_investigations },
        { label: "Leaks Matched", value: data.total_leaks_matched },
      ]
    : []

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-100">Admin Console</h1>
        <p className="mt-1 text-sm text-surface-400">
          Manage users, investigations, and platform activity.
        </p>
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-shimmer rounded-[20px] border border-surface-700 bg-gradient-to-r from-surface-800 via-surface-700 to-surface-800 bg-[length:200%_100%] p-6">
              <div className="h-3 w-20 rounded bg-surface-700/50" />
              <div className="mt-3 h-8 w-16 rounded bg-surface-700/30" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-[14px] border border-semantic-error/20 bg-semantic-error/5 px-4 py-3 text-sm text-semantic-error">
          {error}
        </div>
      )}

      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-[20px] border border-surface-700 bg-surface-800 p-6 transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-500/20"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-surface-400">
                {s.label}
              </p>
              <p className="mt-2 text-4xl font-bold tabular-nums text-surface-100">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
