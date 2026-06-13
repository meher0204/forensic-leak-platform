import { useEffect, useState } from "react"
import { listRecipients, createRecipient, updateRecipient, deleteRecipient } from "../api/recipients"
import type { Recipient } from "../types/recipient"

export default function RecipientsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Recipient | null>(null)
  const [form, setForm] = useState({ name: "", email: "", notes: "" })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setError(null)
    setLoading(true)
    listRecipients()
      .then(setRecipients)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: "", email: "", notes: "" })
    setShowForm(true)
  }

  const openEdit = (r: Recipient) => {
    setEditing(r)
    setForm({ name: r.name, email: r.email, notes: r.notes || "" })
    setShowForm(true)
  }

  const [formError, setFormError] = useState<string | null>(null)

  const handleSave = async () => {
    setFormError(null)
    if (!form.name || !form.name.trim()) {
      setFormError("Name is required")
      return
    }
    if (!form.email || !form.email.trim()) {
      setFormError("Email is required")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setFormError("Enter a valid email address")
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await updateRecipient(editing.id, form)
      } else {
        await createRecipient(form)
      }
      setShowForm(false)
      load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this recipient? This cannot be undone.")) return
    try {
      await deleteRecipient(id)
      load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Recipients</h1>
          <p className="mt-1 text-sm text-surface-400">
            People who will receive watermarked copies of your images
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-[14px] bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-400"
        >
          Add Recipient
        </button>
      </div>

      {error && (
        <div className="rounded-[14px] border border-semantic-error/20 bg-semantic-error/5 px-4 py-3 text-sm text-semantic-error">
          {error}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-md rounded-[20px] border border-surface-700 bg-surface-800 p-6">
            <h2 className="text-base font-semibold text-surface-100">
              {editing ? "Edit Recipient" : "Add Recipient"}
            </h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-surface-400">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1.5 w-full rounded-[14px] border border-surface-700 bg-surface-950/50 px-3.5 py-2.5 text-sm text-surface-100 placeholder-surface-500 outline-none transition-colors focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-surface-400">Email</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1.5 w-full rounded-[14px] border border-surface-700 bg-surface-950/50 px-3.5 py-2.5 text-sm text-surface-100 placeholder-surface-500 outline-none transition-colors focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20"
                  placeholder="john@corp.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-surface-400">Notes (optional)</label>
                <input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="mt-1.5 w-full rounded-[14px] border border-surface-700 bg-surface-950/50 px-3.5 py-2.5 text-sm text-surface-100 placeholder-surface-500 outline-none transition-colors focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20"
                  placeholder="Team lead"
                />
              </div>
            </div>
            {formError && (
              <div className="mt-4 rounded-[14px] border border-semantic-error/20 bg-semantic-error/5 px-3.5 py-2.5 text-sm text-semantic-error">
                {formError}
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-[14px] border border-surface-700 px-4 py-2 text-sm text-surface-300 transition-colors hover:bg-surface-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-[14px] bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-400 disabled:opacity-50"
              >
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-shimmer rounded-[14px] border border-surface-700 bg-gradient-to-r from-surface-800 via-surface-700 to-surface-800 bg-[length:200%_100%] px-5 py-4">
              <div className="h-4 w-36 rounded bg-surface-700/50" />
              <div className="mt-2 h-3 w-24 rounded bg-surface-700/30" />
            </div>
          ))}
        </div>
      ) : recipients.length === 0 ? (
        <div className="rounded-[20px] border border-surface-700 bg-surface-800 py-16 text-center">
          <p className="text-sm font-medium text-surface-400">No recipients yet</p>
          <p className="mt-1 text-sm text-surface-400">
            Add recipients to start distributing watermarked copies
          </p>
          <button
            onClick={openCreate}
            className="mt-5 rounded-[14px] bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.02] hover:bg-brand-400"
          >
            Add Your First Recipient
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[20px] border border-surface-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-700 bg-surface-950/50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                  Name
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                  Email
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                  Notes
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-surface-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-surface-700 transition-all duration-150 hover:bg-surface-800/80"
                >
                  <td className="px-5 py-3.5 font-medium text-surface-200">{r.name}</td>
                  <td className="px-5 py-3.5 text-surface-400">{r.email}</td>
                  <td className="px-5 py-3.5 text-surface-400">{r.notes || "\u2014"}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => openEdit(r)}
                      className="rounded-[10px] px-3 py-1.5 text-xs font-medium text-surface-400 transition-all duration-150 hover:bg-brand-500/10 hover:text-brand-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="ml-1 rounded-[10px] px-3 py-1.5 text-xs font-medium text-surface-400 transition-all duration-150 hover:bg-semantic-error/10 hover:text-semantic-error"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
