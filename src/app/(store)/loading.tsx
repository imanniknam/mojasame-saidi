export default function StoreLoading() {
  return (
    <main className="ds-section mx-auto max-w-6xl animate-pulse space-y-8 pb-28">
      <div className="space-y-3">
        <div className="h-4 w-24 rounded-full bg-muted/60" />
        <div className="h-9 w-56 rounded-xl bg-muted/60" />
        <div className="h-5 w-full max-w-md rounded-lg bg-muted/50" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-elegant"
          >
            <div className="aspect-[4/5] bg-muted/50" />
            <div className="space-y-3 p-4">
              <div className="h-4 rounded-md bg-muted/60" />
              <div className="h-4 w-2/3 rounded-md bg-muted/50" />
              <div className="h-6 w-24 rounded-md bg-muted/60" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
