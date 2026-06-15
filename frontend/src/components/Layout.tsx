import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "./Sidebar"
import ErrorBoundary from "./ErrorBoundary"
import { ToastProvider } from "./Toast"

export default function Layout() {
  const location = useLocation()

  return (
    <div>
      <Sidebar />
      <main className="relative z-10 ml-60 h-screen overflow-y-auto">
        <div className="px-10 py-8">
          <ErrorBoundary>
            <ToastProvider>
              <div key={location.pathname} className="animate-page-enter">
                <Outlet />
              </div>
            </ToastProvider>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
