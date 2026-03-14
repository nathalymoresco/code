export function FeedSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="feed-skeleton">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-xl border border-sand-200 bg-white"
        >
          <div className="aspect-[4/3] bg-sand-100" />
          <div className="space-y-3 p-4">
            <div className="h-5 w-3/4 rounded bg-sand-100" />
            <div className="h-4 w-1/2 rounded bg-sand-100" />
            <div className="flex gap-1">
              <div className="h-5 w-14 rounded-full bg-sand-100" />
              <div className="h-5 w-14 rounded-full bg-sand-100" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-20 rounded bg-sand-100" />
              <div className="h-4 w-16 rounded bg-sand-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
