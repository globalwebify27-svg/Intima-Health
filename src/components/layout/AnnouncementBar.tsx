import Link from "next/link";
import { HelpCircle } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="w-full bg-primary py-2 px-4 text-center text-sm font-medium text-primary-foreground">
      <p className="inline-flex items-center justify-center flex-wrap gap-1.5">
        <HelpCircle className="w-4 h-4 inline-block shrink-0 opacity-90" />
        <span>Have questions about our hospital and services?</span>
        <Link href="/faq" className="font-bold underline hover:text-white/80 ml-1 transition-colors">
          View FAQs &rarr;
        </Link>
      </p>
    </div>
  );
}
