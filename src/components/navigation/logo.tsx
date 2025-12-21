import { Globe } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        <Globe className="h-5 w-5 text-primary" />
      </div>
      <span>GeoTracker</span>
    </Link>
  );
}

