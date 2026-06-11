export function SkeletonBar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded bg-gradient-to-r from-surface-800 via-surface-700 to-surface-800 bg-[length:200%_100%] ${className}`}
    />
  )
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-surface-800 bg-surface-900/50 p-5">
      <SkeletonBar className="mb-3 h-3 w-20" />
      <SkeletonBar className="h-10 w-16" />
    </div>
  )
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-surface-800/50">
      {Array.from({ length: cols }, (_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonBar className="h-4 w-full max-w-[140px]" />
        </td>
      ))}
    </tr>
  )
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-surface-800 px-4 py-3">
      <SkeletonBar className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <SkeletonBar className="h-4 w-36" />
        <SkeletonBar className="h-3 w-24" />
      </div>
      <SkeletonBar className="h-5 w-14 rounded-full" />
    </div>
  )
}
