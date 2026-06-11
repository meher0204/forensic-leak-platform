import { NavLink } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/upload", label: "Upload" },
  { to: "/recipients", label: "Recipients" },
  { to: "/detect", label: "Detect Leak" },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-surface-800 bg-surface-950">
      <div className="border-b border-surface-800 px-5 py-4">
        <p className="text-sm font-semibold text-surface-100">Forensic Leak</p>
        <p className="text-[11px] font-medium uppercase tracking-wider text-surface-500">
          Attribution Platform
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-brand-400/10 text-brand-400"
                  : "text-surface-400 hover:bg-surface-800/50 hover:text-surface-200"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute -left-3 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-brand-400" />
                )}
                {link.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-surface-800">
        {user && (
          <div className="flex items-center gap-3 border-b border-surface-800 px-5 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-400/10 text-sm font-semibold text-brand-400">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-surface-200">{user.username}</p>
              <p className="truncate text-xs text-surface-500">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-5 py-3 text-sm text-surface-500 transition-colors hover:bg-surface-800/50 hover:text-surface-300"
        >
          <span className="text-base opacity-50">⊘</span>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
