export function SkeletonBar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded bg-gradient-to-r from-surface-800 via-surface-700 to-surface-800 bg-[length:200%_100%] ${className}`}
    />
  )
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-[20px] border border-surface-700 bg-surface-800 p-6">
      <SkeletonBar className="mb-3 h-3 w-20" />
      <SkeletonBar className="h-10 w-16" />
    </div>
  )
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-surface-700">
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
    <div className="rounded-[14px] border border-surface-700 bg-surface-800 px-5 py-4">
      <div className="flex-1 space-y-2">
        <SkeletonBar className="h-4 w-36" />
        <SkeletonBar className="h-3 w-24" />
      </div>
    </div>
  )
}
