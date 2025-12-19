"use client";

import AnimatedGradientBackground from "@/components/landing-page/background-shader";
import { cn } from "@/utils/utils";

interface HeroProps {
  children: React.ReactNode;
  className?: string;
}

const Hero = ({ children, className }: HeroProps) => {
  return (
    <div className={cn("relative w-full min-h-[80vh] overflow-hidden", className)}>
      {/* Gradient Background */}
      <div className="absolute inset-0 z-0">
        <AnimatedGradientBackground />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 py-24 md:py-32 text-center">
        {children}
      </div>
    </div>
  );
};

export { Hero };
