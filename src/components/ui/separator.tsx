"use client";

import * as React from "react";
// Removed version number from import; package versions should be handled via package.json
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "./utils";

/**
 * Separator
 * A thin line used to visually separate content.
 * Wraps Radix Separator primitive with optional orientation and decorative props.
 */
function Separator({
  className,
  orientation = "horizontal", // Default orientation is horizontal
  decorative = true, // Decorative means it’s ignored by assistive tech
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative} // Tells screen readers to ignore if decorative
      orientation={orientation} // Horizontal or vertical separator
      className={cn(
        // Base styles
        "bg-border shrink-0 " +
          // Horizontal separator: height 1px, full width
          "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full " +
          // Vertical separator: width 1px, full height
          "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  );
}

export { Separator };
