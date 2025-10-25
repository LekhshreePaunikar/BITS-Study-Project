"use client"; // Indicates React Server Component compatibility

import * as React from "react"; // Import React
import * as LabelPrimitive from "@radix-ui/react-label"; // Import Label primitives

import { cn } from "./utils"; // Import className utility

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) { // Type-safe props

  return (
    <LabelPrimitive.Root
      data-slot="label" // Custom data attribute
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      )} // Combine default and custom classes
      {...props} // Pass down other props
    />
  );
}

export { Label }; // Export for external usenpm