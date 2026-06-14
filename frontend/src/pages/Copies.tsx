import { useEffect, useState } from "react"
import { listCopies, deleteCopy } from "../api/copies"
import type { WatermarkedCopy } from "../api/copies"
import { getApiUrl } from "../api/client"

export default function CopiesPage() {
  const [copies, setCopies] = useState<WatermarkedCopy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setError(null)
    setLoading(true)
    listCopies()
      .then(setCopies)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this watermarked copy? This cannot be undone.")) return
    try {
      await deleteCopy(id)
      load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-surface-100">Watermarked Copies</h1>
        <p className="mt-1 text-sm text-surface-400">
          All generated watermarked copies and their recipients
        </p>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-shimmer rounded-[12px] border border-surface-750 bg-gradient-to-r from-surface-850 via-surface-750 to-surface-850 bg-[length:200%_100%] px-5 py-4">
              <div className="h-4 w-48 rounded bg-surface-700/50" />
              <div className="mt-2 h-3 w-32 rounded bg-surface-700/30" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-[12px] border border-semantic-error/15 bg-semantic-error/5 px-4 py-3 text-sm text-semantic-error">
          {error}
        </div>
      )}

      {!loading && !error && copies.length === 0 && (
        <div className="rounded-[16px] border border-surface-750 bg-surface-850 py-16 text-center">
          <p className="text-sm font-medium text-surface-400">No watermarked copies yet</p>
          <p className="mt-1 text-sm text-surface-400">
            Upload an image and generate watermarked copies to see them here
          </p>
        </div>
      )}

      {!loading && copies.length > 0 && (
        <div className="overflow-hidden rounded-[16px] border border-surface-750">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-750 bg-surface-900/60">
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500">
                  Image
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500">
                  Recipient
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500">
                  Watermark ID
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500">
                  Created
                </th>
                <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {copies.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-surface-750 transition-colors hover:bg-surface-850/80"
                >
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-surface-200">{c.image_filename}</p>
                    <p className="mt-0.5 text-xs text-surface-500">ID: {c.image_id}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-surface-200">{c.recipient_name}</p>
                    <p className="mt-0.5 text-xs text-surface-400">{c.recipient_email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-surface-400">{c.watermark_id}</span>
                  </td>
                  <td className="px-5 py-3.5 text-surface-400">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <a
                      href={getApiUrl(`/api/copies/${c.id}/download`)}
                      download
                      className="inline-block rounded-[8px] bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition-all duration-150 hover:bg-brand-400"
                    >
                      Download
                    </a>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="ml-1 rounded-[8px] px-3 py-1.5 text-xs font-medium text-surface-400 transition-colors hover:bg-accent-leak/10 hover:text-accent-leak"
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
