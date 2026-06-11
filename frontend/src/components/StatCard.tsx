interface StatCardProps {
  label: string
  value: number
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-xl border border-surface-800 bg-surface-900/50 p-5 transition-colors hover:border-surface-700">
      <p className="text-xs font-semibold uppercase tracking-widest text-surface-500">
        {label}
      </p>
      <p className="mt-2 text-4xl font-bold tabular-nums text-surface-100">
        {value}
      </p>
    </div>
  )
}
