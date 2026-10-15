export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-xs transition-opacity duration-300 pointer-events-none">
      <div className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-card/80 border border-border/60 shadow-xl backdrop-blur-md">
        <div className="relative flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
