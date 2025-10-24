"use client";

import * as React from "react";
// Import the Radix Label Primitive for base accessibility and behavior
import * as LabelPrimitive from "@radix-ui/react-label@2.1.2";

// Import the utility function for conditionally joining class names
import { cn } from "./utils";

/**
 * Defines the props for the Label component by inheriting props from the Radix Label Root component.
 */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      // Set a data-slot attribute for testing or styling purposes
      data-slot="label"
      className={cn(
        // Base styling for the label text and alignment
        "flex items-center gap-2 text-sm leading-none font-medium select-none",
        
        // Styles for when the parent element (like a form field wrapper) is disabled.
        // This targets the label when the component it's labeling is disabled.
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
        
        // Styles for when the associated peer (sibling input) is disabled.
        // This is the standard way to style a label linked to a disabled input.
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        
        // Apply any custom class names passed via props
        className,
      )}
      {...props}
    />
  );
}

export { Label };