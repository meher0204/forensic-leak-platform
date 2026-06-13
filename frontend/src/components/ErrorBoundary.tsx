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
          <h2 className="text-xl font-semibold text-surface-100">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-surface-400">
            {this.state.error?.message || "An unexpected error occurred while rendering this page."}
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-[14px] bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-400"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Back to Dashboard
          </Link>
        </div>
      )
    }

    return this.props.children
  }
}
