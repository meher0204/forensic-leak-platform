import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import ErrorBoundary from "./ErrorBoundary"
import { ToastProvider } from "./Toast"

export default function Layout() {
  return (
    <div className="relative">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,92,252,0.07), transparent 60%)",
        }}
      />
      <Sidebar />
      <main className="relative z-10 ml-56 h-screen overflow-y-auto">
        <div className="px-10 py-8">
          <ErrorBoundary>
            <ToastProvider>
              <Outlet />
            </ToastProvider>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
