export default function PublicLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="relative flex items-center justify-center">
        {/* Animated outer ring */}
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        {/* Pulsing inner dot */}
        <div className="absolute w-6 h-6 rounded-full bg-primary/30 animate-ping" />
      </div>
      <p className="mt-6 text-sm font-medium text-muted-foreground animate-pulse tracking-wide">
        Loading...
      </p>
    </div>
  );
}
