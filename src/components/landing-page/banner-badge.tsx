"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/utils/utils";

interface BannerBadgeProps {
  children: React.ReactNode;
  className?: string;
  badge?: string;
}

const BannerBadge = ({ children, className, badge = "New" }: BannerBadgeProps) => {
  return (
    <div
      className={cn(
        "group relative flex cursor-pointer items-center justify-center rounded-full border border-border/40 bg-muted/50 p-1 pr-4 text-sm font-medium backdrop-blur-md transition-all hover:bg-muted/80",
        className
      )}
    >
      {/* Moving Shine Effect */}
      <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
        <div className="absolute -inset-[100%] animate-shimmer bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.2),55%,transparent)] bg-[length:200%_100%]" />
      </div>

      <div className="flex items-center gap-3 relative z-10">
        <div className="flex items-center gap-2 rounded-full bg-background/50 px-2.5 py-0.5 border border-border/50 text-[10px] uppercase tracking-wider font-bold text-primary">
          {badge}
        </div>
        
        <span className="text-foreground/90 flex items-center gap-1 text-xs md:text-sm">
          {children}
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  );
};

export { BannerBadge };
