import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import ErrorBoundary from "./ErrorBoundary"
import { ToastProvider } from "./Toast"

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-surface-950">
      <Sidebar />
      <main className="flex flex-1 flex-col">
        <div className="flex-1 overflow-y-auto p-8">
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
