export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

export function getApiUrl(path: string): string {
  const base = API_BASE_URL || ""
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${base}${normalized}`
}

const TIMEOUT_MS = 30_000

export class ApiError extends Error {
  status: number
  type: string | null

  constructor(message: string, status: number, type: string | null = null) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.type = type
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
  signal?: AbortSignal,
): Promise<T> {
  const url = getApiUrl(`/api${endpoint}`)

  const headers: Record<string, string> = {}
  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }

  // Create a timeout controller that aborts the fetch after TIMEOUT_MS.
  // If the caller provides their own signal, respect that instead.
  const timeoutController = new AbortController()
  const timeoutId = setTimeout(() => timeoutController.abort(), TIMEOUT_MS)

  // Combine caller signal with timeout signal
  const combinedSignal = signal
    ? combineAbortSignals(signal, timeoutController.signal)
    : timeoutController.signal

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
      signal: combinedSignal,
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      let detail = res.statusText
      let type: string | null = null
      try {
        const body = await res.json()
        detail = body.detail || detail
        type = body.type || null
      } catch {
        // response body is not JSON — use status text
      }
      throw new ApiError(detail, res.status, type)
    }

    // Handle 204 No Content
    if (res.status === 204) {
      return undefined as T
    }

    return res.json()
  } catch (err) {
    clearTimeout(timeoutId)

    if (err instanceof ApiError) throw err

    // Network errors (offline, DNS failure, connection refused)
    if (err instanceof TypeError) {
      throw new ApiError(
        "Network error — check your connection and ensure the server is running.",
        0,
        "network_error",
      )
    }

    // AbortError (timeout or manual cancellation)
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(
        "Request timed out — the server did not respond in time.",
        408,
        "timeout",
      )
    }

    throw new ApiError(
      err instanceof Error ? err.message : "An unexpected error occurred",
      0,
      "unknown",
    )
  }
}

/** Merge two AbortSignals into one. */
function combineAbortSignals(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController()
  for (const s of signals) {
    if (s.aborted) {
      controller.abort(s.reason)
      return controller.signal
    }
    s.addEventListener("abort", () => controller.abort(s.reason), { once: true })
  }
  return controller.signal
}
