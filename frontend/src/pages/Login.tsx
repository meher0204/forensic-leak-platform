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
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="rounded-[20px] border border-surface-700 bg-surface-800 p-8">
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-surface-100">Forensic Leak Platform</h1>
            <p className="mt-1 text-sm text-surface-400">Sign in to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-surface-400">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5 w-full rounded-[14px] border border-surface-700 bg-surface-950/50 px-3.5 py-2.5 text-sm text-surface-100 placeholder-surface-500 outline-none transition-colors focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20"
                placeholder="Enter your username"
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm font-medium text-surface-400">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-[14px] border border-surface-700 bg-surface-950/50 px-3.5 py-2.5 text-sm text-surface-100 placeholder-surface-500 outline-none transition-colors focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="rounded-[14px] border border-semantic-error/20 bg-semantic-error/5 px-3.5 py-2.5 text-sm text-semantic-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[14px] bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
