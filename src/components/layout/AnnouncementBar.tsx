export function AnnouncementBar() {
  return (
    <div className="w-full bg-primary py-2 text-center text-sm font-medium text-primary-foreground">
      <p>
        <span className="font-semibold">New:</span> We now offer discreet video consultations for couples therapy.
        <a href="/consultations" className="ml-2 underline hover:text-white/80">Learn More &rarr;</a>
      </p>
    </div>
  );
}
