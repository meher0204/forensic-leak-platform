import { useEffect, useState } from "react"
import {
  getAdminOverview,
  getAdminUsers,
  updateUserRole,
  updateUserStatus,
  getUserActivity,
  resetDemoData,
  type AdminOverview,
  type AdminUser,
  type UserActivity,
} from "../api/admin"
import { useAuth } from "../contexts/AuthContext"

export default function AdminPage() {
  const [data, setData] = useState<AdminOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [users, setUsers] = useState<AdminUser[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)

  const [expandedUserId, setExpandedUserId] = useState<number | null>(null)
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null)
  const [activityLoading, setActivityLoading] = useState(false)

  const { user: currentUser } = useAuth()

  const handleRoleChange = async (targetUser: AdminUser) => {
    const newRole = targetUser.role === "admin" ? "investigator" : "admin"
    setUpdatingUserId(targetUser.id)
    setActionError(null)
    try {
      const updated = await updateUserRole(targetUser.id, newRole)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    } catch (e: any) {
      setActionError(e.message)
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleStatusToggle = async (targetUser: AdminUser) => {
    const newStatus = !targetUser.is_active
    setUpdatingUserId(targetUser.id)
    setActionError(null)
    try {
      const updated = await updateUserStatus(targetUser.id, newStatus)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    } catch (e: any) {
      setActionError(e.message)
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleToggleActivity = async (userId: number) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null)
      setUserActivity(null)
      return
    }
    setExpandedUserId(userId)
    setActivityLoading(true)
    setActionError(null)
    try {
      const activity = await getUserActivity(userId)
      setUserActivity(activity)
    } catch (e: any) {
      setActionError(e.message)
    } finally {
      setActivityLoading(false)
    }
  }

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
        <h1 className="text-[22px] font-bold tracking-tight text-surface-100">Admin Console</h1>
        <p className="mt-1 text-sm text-surface-400">
          Manage users, investigations, and platform activity.
        </p>
      </div>

      {actionError && (
        <div className="rounded-[12px] border border-semantic-error/15 bg-semantic-error/5 px-4 py-3 text-sm text-semantic-error">
          {actionError}
        </div>
      )}

      {/* ── Overview Stats ── */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-shimmer rounded-[16px] border border-surface-750 bg-gradient-to-r from-surface-850 via-surface-750 to-surface-850 bg-[length:200%_100%] p-6">
              <div className="h-3 w-20 rounded bg-surface-700/50" />
              <div className="mt-3 h-8 w-16 rounded bg-surface-700/30" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-[12px] border border-semantic-error/15 bg-semantic-error/5 px-4 py-3 text-sm text-semantic-error">
          {error}
        </div>
      )}

      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-[16px] border border-surface-750 bg-surface-850 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/[0.04]"
            >
              <div className="absolute left-0 top-0 h-full w-0.5 bg-brand-500" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-400">
                {s.label}
              </p>
              <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight text-surface-100">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Users Table ── */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <span className="h-4 w-1 rounded-full bg-brand-500" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-400">
            Users
          </h2>
        </div>

        {usersLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-shimmer rounded-[12px] border border-surface-750 bg-gradient-to-r from-surface-850 via-surface-750 to-surface-850 bg-[length:200%_100%] px-5 py-4">
                <div className="h-4 w-36 rounded bg-surface-700/50" />
                <div className="mt-2 h-3 w-24 rounded bg-surface-700/30" />
              </div>
            ))}
          </div>
        )}

        {usersError && (
          <div className="rounded-[12px] border border-semantic-error/15 bg-semantic-error/5 px-4 py-3 text-sm text-semantic-error">
            {usersError}
          </div>
        )}

        {!usersLoading && !usersError && (
          <div className="overflow-hidden rounded-[16px] border border-surface-750">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-750 bg-surface-900/60">
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500">
                    Username
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500">
                    Email
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500">
                    Role
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <>
                    <tr
                      key={u.id}
                      className="border-b border-surface-750 transition-colors hover:bg-surface-850/80"
                    >
                      <td className="px-5 py-3.5 font-medium text-surface-200">{u.username}</td>
                      <td className="px-5 py-3.5 text-surface-400">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded-[6px] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                            u.role === "admin"
                              ? "bg-brand-500/10 text-brand-400"
                              : "bg-surface-750 text-surface-400"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded-[6px] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                            u.is_active
                              ? "bg-semantic-success/10 text-semantic-success"
                              : "bg-semantic-error/10 text-semantic-error"
                          }`}
                        >
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleToggleActivity(u.id)}
                            className="rounded-[8px] border border-surface-750 px-3 py-1.5 text-[11px] font-semibold text-surface-400 transition-all duration-150 hover:bg-surface-850"
                          >
                            {expandedUserId === u.id ? "Hide" : "Activity"}
                          </button>
                          {u.id === currentUser?.id ? (
                            <span className="inline-flex items-center text-[11px] text-surface-500 italic">You</span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleRoleChange(u)}
                                disabled={updatingUserId === u.id}
                                className={`rounded-[8px] px-3 py-1.5 text-[11px] font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
                                  u.role === "admin"
                                    ? "border border-semantic-error/20 text-semantic-error hover:bg-semantic-error/5"
                                    : "border border-brand-500/20 text-brand-400 hover:bg-brand-500/5"
                                }`}
                              >
                                {updatingUserId === u.id ? "..." : u.role === "admin" ? "Demote" : "Promote"}
                              </button>
                              <button
                                onClick={() => handleStatusToggle(u)}
                                disabled={updatingUserId === u.id}
                                className={`rounded-[8px] border px-3 py-1.5 text-[11px] font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
                                  u.is_active
                                    ? "border-semantic-error/20 text-semantic-error hover:bg-semantic-error/5"
                                    : "border-semantic-success/20 text-semantic-success hover:bg-semantic-success/5"
                                }`}
                              >
                                {updatingUserId === u.id ? "..." : u.is_active ? "Deactivate" : "Reactivate"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedUserId === u.id && (
                      <tr key={`${u.id}-activity`}>
                        <td colSpan={5} className="border-b border-surface-750 bg-surface-900/40 px-5 py-4">
                          {activityLoading ? (
                            <div className="flex items-center gap-3 text-sm text-surface-400">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
                              Loading activity...
                            </div>
                          ) : userActivity ? (
                            <div className="grid gap-4 sm:grid-cols-4">
                              {[
                                { label: "Images", value: userActivity.images_count },
                                { label: "Recipients", value: userActivity.recipients_count },
                                { label: "Copies", value: userActivity.copies_count },
                                { label: "Investigations", value: userActivity.investigations_count },
                              ].map((s) => (
                                <div key={s.label} className="rounded-[10px] border border-surface-750 bg-surface-850 px-4 py-3 text-center">
                                  <p className="text-[11px] font-semibold uppercase tracking-wider text-surface-500">{s.label}</p>
                                  <p className="mt-1 text-xl font-bold text-surface-200">{s.value}</p>
                                </div>
                              ))}
                              {userActivity.recent_items.length > 0 && (
                                <div className="sm:col-span-4">
                                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-surface-500">
                                    Recent Investigations
                                  </p>
                                  <ul className="space-y-1">
                                    {userActivity.recent_items.map((item, i) => (
                                      <li key={i} className="text-sm text-surface-400">{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Danger Zone ── */}
      <section className="rounded-[16px] border border-semantic-error/20 bg-semantic-error/5 p-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-semantic-error">
          Danger Zone
        </h2>
        <p className="mt-1 text-sm text-surface-400">
          Reset all demo data. This deletes images, recipients, watermarked copies, watermark records, and investigations. User accounts and sessions are preserved.
        </p>
        <button
          onClick={() => {
            if (window.confirm("Reset all demo data? This cannot be undone.")) {
              setActionError(null)
              resetDemoData()
                .then(() => {
                  getAdminOverview().then(setData)
                  getAdminUsers().then(setUsers)
                })
                .catch((e) => setActionError(e.message))
            }
          }}
          className="mt-4 rounded-[10px] border border-semantic-error/30 px-4 py-2 text-sm font-semibold text-semantic-error transition-colors hover:bg-semantic-error/5"
        >
          Reset Demo Data
        </button>
      </section>
    </div>
  )
}