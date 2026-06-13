import { useEffect, useState } from "react"
import { getAdminOverview, getAdminUsers } from "../api/admin"
import type { AdminOverview, AdminUser } from "../api/admin"

export default function AdminPage() {
  const [data, setData] = useState<AdminOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [users, setUsers] = useState<AdminUser[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)

  useEffect(() => {
    getAdminOverview()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    getAdminUsers()
      .then(setUsers)
      .catch((e) => setUsersError(e.message))
      .finally(() => setUsersLoading(false))
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
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-surface-100">Admin Console</h1>
        <p className="mt-1 text-sm text-surface-400">
          Manage users, investigations, and platform activity.
        </p>
      </div>

      {/* ── Overview Stats ── */}
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

      {/* ── Users Table ── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500">
          Users
        </h2>

        {usersLoading && (
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-shimmer rounded-[14px] border border-surface-700 bg-gradient-to-r from-surface-800 via-surface-700 to-surface-800 bg-[length:200%_100%] px-5 py-4">
                <div className="h-4 w-36 rounded bg-surface-700/50" />
                <div className="mt-2 h-3 w-24 rounded bg-surface-700/30" />
              </div>
            ))}
          </div>
        )}

        {usersError && (
          <div className="mt-4 rounded-[14px] border border-semantic-error/20 bg-semantic-error/5 px-4 py-3 text-sm text-semantic-error">
            {usersError}
          </div>
        )}

        {!usersLoading && !usersError && (
          <div className="mt-4 overflow-hidden rounded-[20px] border border-surface-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-700 bg-surface-950/50">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                    Username
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                    Email
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                    Role
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-surface-500">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-surface-700 transition-all duration-150 hover:bg-surface-800/80"
                  >
                    <td className="px-5 py-3.5 font-medium text-surface-200">{u.username}</td>
                    <td className="px-5 py-3.5 text-surface-400">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`rounded-[6px] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                          u.role === "admin"
                            ? "bg-brand-500/10 text-brand-400"
                            : "bg-surface-700 text-surface-400"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-surface-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
