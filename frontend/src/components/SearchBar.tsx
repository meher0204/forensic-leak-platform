import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { search } from "../api/search"
import type { SearchResultItem } from "../api/search"

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([])
      setOpen(false)
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(() => {
      setLoading(true)
      search(query.trim(), controller.signal)
        .then((res) => {
          setResults(res.results)
          setOpen(true)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }, 250)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSelect(item: SearchResultItem) {
    setOpen(false)
    setQuery("")
    navigate(item.url)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  const typeIcons: Record<string, string> = {
    image: "🖼",
    recipient: "👤",
    investigation: "🔍",
    copy: "📄",
  }

  return (
    <div ref={containerRef} className="relative w-80">
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-surface-400">
          {loading ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className="w-full rounded-[10px] border border-surface-750 bg-surface-850 py-2 pl-10 pr-4 text-sm text-surface-200 placeholder-surface-500 outline-none transition-all duration-150 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-[12px] border border-surface-750 bg-surface-900 shadow-xl">
          <div className="max-h-96 overflow-y-auto py-2">
            {results.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelect(item)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 hover:bg-surface-750/60"
              >
                <span className="flex-shrink-0 text-base">{typeIcons[item.type]}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-surface-200">{item.label}</p>
                  <p className="truncate text-xs text-surface-400">{item.subtitle}</p>
                </div>
                <span className="flex-shrink-0 text-[11px] uppercase tracking-wider text-surface-500">
                  {item.type}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {open && query.trim().length > 0 && !loading && results.length === 0 && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-[12px] border border-surface-750 bg-surface-900 px-4 py-3 text-sm text-surface-400 shadow-xl">
          No results found
        </div>
      )}
    </div>
  )
}
