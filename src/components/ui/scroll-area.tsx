"use client";

import * as React from "react";
// Removed version numbers from imports; versioning is handled in package.json
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "./utils";

/**
 * ScrollArea
 * Wrapper around Radix ScrollArea primitive.
 * Provides a scrollable container with custom scrollbars.
 */
function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)} // Root container, relative for positioning scrollbar
      {...props}
    >
      {/* The viewport where content is visible */}
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children} {/* Scrollable content goes here */}
      </ScrollAreaPrimitive.Viewport>

      {/* Custom scrollbars */}
      <ScrollBar /> 

      {/* The corner element for when both scrollbars are visible */}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

/**
 * ScrollBar
 * Custom scrollbar component for the ScrollArea.
 * Supports vertical and horizontal orientations.
 */
function ScrollBar({
  className,
  orientation = "vertical", // Default to vertical scrollbar
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none", // Base scrollbar styling
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent", // Vertical scrollbar styling
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent", // Horizontal scrollbar styling
        className
      )}
      {...props}
    >
      {/* The draggable thumb inside the scrollbar */}
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
