export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20 animate-pulse">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-5 w-32 bg-muted rounded mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div className="space-y-6">
            <div className="aspect-square bg-muted/60 rounded-[2.5rem] border border-border" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-muted/30 rounded-2xl border border-border" />
              <div className="h-20 bg-muted/30 rounded-2xl border border-border" />
            </div>
          </div>

          <div className="flex flex-col space-y-6">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-10 w-3/4 bg-muted rounded-xl" />
            <div className="h-20 w-full bg-muted/50 rounded-xl" />
            <div className="h-10 w-36 bg-muted rounded-lg" />
            <div className="flex gap-4 pt-4">
              <div className="h-14 flex-1 bg-muted rounded-full" />
              <div className="h-14 flex-1 bg-muted rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

