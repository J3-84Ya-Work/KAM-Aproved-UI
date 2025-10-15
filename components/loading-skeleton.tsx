export function CardSkeleton() {
  return (
    <div className="modern-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-muted animate-shimmer rounded" />
        <div className="h-4 w-4 bg-muted animate-shimmer rounded" />
      </div>
      <div className="h-8 w-16 bg-muted animate-shimmer rounded" />
      <div className="h-3 w-32 bg-muted animate-shimmer rounded" />
    </div>
  )
}

export function ChatListSkeleton() {
  return (
    <div className="divide-y divide-border">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="h-12 w-12 rounded-full bg-muted animate-shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-muted animate-shimmer rounded" />
            <div className="h-3 w-48 bg-muted animate-shimmer rounded" />
          </div>
          <div className="h-3 w-12 bg-muted animate-shimmer rounded" />
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 border border-border rounded-xl">
          <div className="space-y-2 flex-1">
            <div className="h-4 w-24 bg-muted animate-shimmer rounded" />
            <div className="h-3 w-40 bg-muted animate-shimmer rounded" />
          </div>
          <div className="h-6 w-20 bg-muted animate-shimmer rounded-full" />
        </div>
      ))}
    </div>
  )
}
