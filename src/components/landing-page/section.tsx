import { cn } from "@/utils/utils";

interface LandingSectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  noBorderBottom?: boolean;
}

export function LandingSection({
  children,
  className,
  noBorderBottom = false,
  ...props
}: LandingSectionProps) {
  return (
    <section
      className={cn(
        "w-full border-b border-dashed border-border/40 last:border-b-0",
        noBorderBottom && "border-b-0",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}



