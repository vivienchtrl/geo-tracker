"use client"

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"

import { cn } from "@/utils/utils"

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "bg-transparent shrink-0 border-dashed border-border/60",
        "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=horizontal]:border-b",
        "data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch data-[orientation=vertical]:border-r",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
