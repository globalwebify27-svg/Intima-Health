export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground animate-pulse">
      {/* Header Skeleton */}
      <section className="pt-12 pb-16 bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="h-10 w-2/3 bg-muted rounded-xl" />
            <div className="h-5 w-full bg-muted/70 rounded-lg max-w-xl" />
          </div>
        </div>
      </section>

      {/* Main Content Skeleton */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Sidebar Skeleton */}
            <div className="hidden md:block w-64 shrink-0 space-y-6">
              <div className="h-6 w-32 bg-muted rounded-md mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-7 w-full bg-muted/50 rounded-lg" />
                ))}
              </div>
              <div className="pt-6 border-t border-border space-y-3">
                <div className="h-6 w-28 bg-muted rounded-md" />
                <div className="h-5 w-40 bg-muted/50 rounded" />
                <div className="h-5 w-36 bg-muted/50 rounded" />
              </div>
            </div>

            {/* Product Grid Skeleton */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-8">
                <div className="h-5 w-32 bg-muted rounded" />
                <div className="h-9 w-36 bg-muted rounded-lg" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col bg-card rounded-2xl border border-border overflow-hidden p-6 space-y-4"
                  >
                    <div className="aspect-square bg-muted/60 rounded-xl" />
                    <div className="h-3 w-20 bg-muted rounded" />
                    <div className="h-6 w-3/4 bg-muted rounded" />
                    <div className="h-4 w-full bg-muted/40 rounded" />
                    <div className="flex justify-between items-center pt-4 mt-auto">
                      <div className="h-6 w-20 bg-muted rounded" />
                      <div className="h-8 w-20 bg-muted rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

