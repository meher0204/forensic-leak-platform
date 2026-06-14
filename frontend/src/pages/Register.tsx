import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { register } from "../api/auth"

export default function RegisterPage() {
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("All fields are required")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    try {
      await register({ username: username.trim(), email: email.trim(), password })
      setSuccess(true)
      setTimeout(() => navigate("/login"), 1500)
    } catch (err: any) {
      setError(err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(124,92,252,0.08), transparent 45%)",
        }}
      />
      <div className="relative w-full max-w-sm">
        <div className="rounded-[20px] border border-surface-750 bg-surface-900/80 p-8 backdrop-blur-sm">
          <div className="mb-8">
            <h1 className="text-xl font-semibold tracking-tight text-surface-100">
              Forensic Leak Platform
            </h1>
            <p className="mt-1.5 text-sm text-surface-400">
              Create an account to get started
            </p>
          </div>

          {success ? (
            <div className="rounded-[12px] border border-semantic-success/15 bg-semantic-success/5 px-3.5 py-3 text-sm text-semantic-success text-center">
              Account created successfully! Redirecting to login...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-surface-400">
                  Username
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1.5 w-full rounded-[12px] border border-surface-700 bg-surface-950/60 px-3.5 py-2.5 text-sm text-surface-100 placeholder-surface-500 outline-none transition-colors focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20"
                  placeholder="Choose a username"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm font-medium text-surface-400">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-[12px] border border-surface-700 bg-surface-950/60 px-3.5 py-2.5 text-sm text-surface-100 placeholder-surface-500 outline-none transition-colors focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20"
                  placeholder="Enter your email"
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
                  placeholder="At least 8 characters"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-surface-400">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-[12px] border border-surface-700 bg-surface-950/60 px-3.5 py-2.5 text-sm text-surface-100 placeholder-surface-500 outline-none transition-colors focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20"
                  placeholder="Confirm your password"
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
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-surface-500">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-brand-400 hover:text-brand-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
