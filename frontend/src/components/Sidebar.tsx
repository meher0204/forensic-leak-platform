import { NavLink, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export default function Sidebar() {
  const { user, logout } = useAuth()

  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/upload", label: "Upload" },
    { to: "/recipients", label: "Recipients" },
    { to: "/copies", label: "Copies" },
    { to: "/detect", label: "Detect Leak" },
    ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
  ]

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-60 flex-col border-r border-surface-750 bg-surface-950">
      <div className="px-6 pt-8 pb-5">
        <Link to="/home" className="block transition-opacity hover:opacity-80">
          <p className="text-base font-semibold tracking-tight text-surface-100">
            Forensic Leak
          </p>
          <p className="mt-0.5 text-xs font-medium text-surface-500">
            Attribution Platform
          </p>
        </Link>
      </div>

      <div className="mx-6 mb-4 flex items-center gap-2 rounded-[8px] bg-surface-900 px-3 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-semantic-success shadow-[0_0_6px_rgba(45,157,94,0.4)]" />
        <span className="text-xs font-medium text-surface-400">System Online</span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `relative flex items-center rounded-[10px] px-3 py-2 text-base font-medium transition-all duration-150 ${
                isActive
                  ? "bg-brand-500/10 text-brand-400"
                  : "text-surface-400 hover:bg-surface-850/60 hover:text-surface-200"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-surface-750">
        {user && (
          <div className="px-5 py-3.5">
            <p className="text-base font-medium text-surface-200">{user.username}</p>
            <p className="truncate text-sm text-surface-400">{user.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center px-5 py-3 text-base text-surface-400 transition-colors hover:text-surface-200"
        >
          Sign Out
        </button>
      </div>
    </aside>
  )
}
