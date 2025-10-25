"use client";

import * as React from "react";
// Imports the accessible, unstyled primitives for the radio group structure
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CircleIcon } from "lucide-react";

// Utility for merging Tailwind classes
import { cn } from "./utils";

/**
 * RadioGroup component: Provides context for the radio buttons.
 */
function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      // Simple grid layout to space out radio items vertically
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

/**
 * RadioGroupItem component: The actual clickable radio button element.
 */
function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        // Base styling: Defines the unselected circle appearance and size (4x4)
        "border-input text-primary dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50",
        
        // Comprehensive Focus and Validation Styling
        // Applies a strong ring/border change on keyboard focus (focus-visible)
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        // Applies destructive styling when the radio group is aria-invalid (failed validation)
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        {/* Lucide icon for the selected state (the inner dot) */}
        <CircleIcon
          // Centers the small circle dot perfectly inside the radio item using absolute positioning
          className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2"
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };