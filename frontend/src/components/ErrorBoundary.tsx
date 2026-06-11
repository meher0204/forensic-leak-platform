import { Component, type ReactNode } from "react"
import { Link } from "react-router-dom"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: any) {
    console.error("ErrorBoundary caught:", error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="mx-auto max-w-md py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-semantic-error/10 text-3xl">
            ⚡
          </div>
          <h2 className="mt-5 text-xl font-semibold text-surface-100">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-surface-400">
            {this.state.error?.message || "An unexpected error occurred while rendering this page."}
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-400"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            ← Back to Dashboard
          </Link>
        </div>
      )
    }

    return this.props.children
  }
}
