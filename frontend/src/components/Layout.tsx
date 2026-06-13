import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import ErrorBoundary from "./ErrorBoundary"
import { ToastProvider } from "./Toast"

export default function Layout() {
  return (
    <div>
      <Sidebar />
      <main className="ml-56 h-screen overflow-y-auto">
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
