export function SkeletonBar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded bg-gradient-to-r from-surface-850 via-surface-750 to-surface-850 bg-[length:200%_100%] ${className}`}
    />
  )
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-[16px] border border-surface-750 bg-surface-850 p-5">
      <SkeletonBar className="mb-3 h-3 w-20" />
      <SkeletonBar className="h-9 w-16" />
    </div>
  )
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-surface-750">
      {Array.from({ length: cols }, (_, i) => (
        <td key={i} className="px-5 py-4">
          <SkeletonBar className="h-4 w-full max-w-[140px]" />
        </td>
      ))}
    </tr>
  )
}

export function ListItemSkeleton() {
  return (
    <div className="rounded-[10px] border border-surface-750 bg-surface-850 px-5 py-4">
      <div className="flex-1 space-y-2">
        <SkeletonBar className="h-4 w-36" />
        <SkeletonBar className="h-3 w-24" />
      </div>
    </div>
  )
}
