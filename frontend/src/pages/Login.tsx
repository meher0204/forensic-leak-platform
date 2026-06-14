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
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 40%, rgba(124,92,252,0.08), transparent 60%)",
        }}
      />
      <div className="relative w-full max-w-sm">
        <div className="rounded-[20px] border border-surface-750 bg-surface-900/80 p-8 backdrop-blur-sm">
          <div className="mb-8">
            <h1 className="text-xl font-semibold tracking-tight text-surface-100">
              Forensic Leak Platform
            </h1>
            <p className="mt-1.5 text-sm text-surface-400">
              Sign in to access the attribution dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-surface-400">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5 w-full rounded-[12px] border border-surface-700 bg-surface-950/60 px-3.5 py-2.5 text-sm text-surface-100 placeholder-surface-500 outline-none transition-colors focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20"
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
                className="mt-1.5 w-full rounded-[12px] border border-surface-700 bg-surface-950/60 px-3.5 py-2.5 text-sm text-surface-100 placeholder-surface-500 outline-none transition-colors focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="rounded-[12px] border border-semantic-error/15 bg-semantic-error/5 px-3.5 py-2.5 text-sm text-semantic-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[12px] bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-brand-400 hover:shadow-lg hover:shadow-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
