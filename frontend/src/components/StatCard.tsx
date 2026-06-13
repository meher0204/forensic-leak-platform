import { useEffect, useState } from "react"

interface StatCardProps {
  label: string
  value: number
}

export default function StatCard({ label, value }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0)
      return
    }
    let start = 0
    const duration = 600
    const steps = 20
    const increment = value / steps
    const timer = setInterval(() => {
      start += increment
      if (start >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(start))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])

  return (
    <div className="rounded-[20px] border border-surface-700 bg-surface-800 p-6 transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-500/20 hover:shadow-lg hover:shadow-brand-500/[0.03]">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-surface-400">{label}</p>
      <p className="text-5xl font-bold tabular-nums text-surface-100">
        {displayValue}
      </p>
    </div>
  )
}
