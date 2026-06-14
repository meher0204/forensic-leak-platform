import { useEffect, useState } from "react"

type StatVariant = "image" | "recipient" | "investigation" | "leak"

interface StatCardProps {
  label: string
  value: number
  variant?: StatVariant
}

const accentMap: Record<StatVariant, { bar: string; border: string; glow: string }> = {
  image: {
    bar: "bg-accent-image",
    border: "hover:border-accent-image/30",
    glow: "shadow-accent-image/[0.04]",
  },
  recipient: {
    bar: "bg-accent-recipient",
    border: "hover:border-accent-recipient/30",
    glow: "shadow-accent-recipient/[0.04]",
  },
  investigation: {
    bar: "bg-accent-investigation",
    border: "hover:border-accent-investigation/30",
    glow: "shadow-accent-investigation/[0.04]",
  },
  leak: {
    bar: "bg-accent-leak",
    border: "hover:border-accent-leak/30",
    glow: "shadow-accent-leak/[0.04]",
  },
}

export default function StatCard({ label, value, variant = "image" }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const a = accentMap[variant]

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
    <div
      className={`relative overflow-hidden rounded-[16px] border border-surface-750 bg-surface-850 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${a.border} ${a.glow}`}
    >
      <div className={`absolute left-0 top-0 h-full w-0.5 ${a.bar}`} />
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-400">
        {label}
      </p>
      <p className="text-4xl font-bold tabular-nums tracking-tight text-surface-100">
        {displayValue}
      </p>
    </div>
  )
}
