import { NavLink, Link } from "react-router-dom"
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
    <aside className="fixed left-0 top-0 flex h-screen w-56 flex-col border-r border-surface-700 bg-surface-950">
      <Link to="/home" className="block px-6 pt-8 pb-6 transition-opacity hover:opacity-80">
        <p className="text-sm font-semibold text-surface-100">Forensic Leak</p>
        <p className="mt-0.5 text-xs text-surface-400">Attribution Platform</p>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `relative block rounded-[14px] px-3 py-2 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-brand-500/10 text-brand-400"
                  : "text-surface-400 hover:bg-surface-800/60 hover:text-surface-200"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r bg-brand-500" />
                )}
                {link.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-surface-700">
        {user && (
          <div className="px-5 py-3.5">
            <p className="text-sm font-medium text-surface-200">{user.username}</p>
            <p className="truncate text-xs text-surface-400">{user.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center px-5 py-3 text-sm text-surface-400 transition-colors hover:text-surface-200"
        >
          Sign Out
        </button>
      </div>
    </aside>
  )
}
