import { cn } from "@/utils/utils";

interface LandingContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function LandingContainer({
  children,
  className,
  ...props
}: LandingContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-7xl w-[calc(100%-2rem)] border-x border-dashed border-border/40",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

