import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: string })?.from || "/"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required")
      return
    }
    setLoading(true)
    try {
      await login(username, password)
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.06)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(34,211,238,0.03)_0%,transparent_50%)]" />
      <div className="relative w-full max-w-sm">
        <div className="rounded-xl border border-surface-800 bg-surface-900/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand-400/10">
              <span className="text-2xl text-brand-400">⬡</span>
            </div>
            <h1 className="mt-5 text-xl font-bold text-surface-100">Forensic Leak Platform</h1>
            <p className="mt-1 text-sm text-surface-500">Sign in to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-surface-400">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-surface-800 bg-surface-950/50 px-3 py-2.5 text-sm text-surface-100 placeholder-surface-600 outline-none transition-colors focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20"
                placeholder="Enter your username"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-surface-400">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-surface-800 bg-surface-950/50 px-3 py-2.5 text-sm text-surface-100 placeholder-surface-600 outline-none transition-colors focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-semantic-error/20 bg-semantic-error/5 px-3 py-2.5 text-xs text-semantic-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
