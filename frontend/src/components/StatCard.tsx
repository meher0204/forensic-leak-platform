interface StatCardProps {
  label: string
  value: number
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-[20px] border border-surface-700 bg-surface-800 p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-surface-400">
        {label}
      </p>
      <p className="mt-2 text-4xl font-bold tabular-nums text-surface-100">
        {value}
      </p>
    </div>
  )
}
