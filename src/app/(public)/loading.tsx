export default function PublicLoading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute h-6 w-6 rounded-full bg-primary/10 animate-ping" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 animate-pulse">
          Loading Page...
        </p>
      </div>
    </div>
  );
}
