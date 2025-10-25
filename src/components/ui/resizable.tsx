"use client";

import * as React from "react";
import { GripVerticalIcon } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "./utils";

/**
 * ResizablePanelGroup
 * Wrapper around Radix PanelGroup to allow horizontal or vertical panel layouts.
 */
function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        // Flex layout with full width and height
        "flex h-full w-full " +
        // Tailwind JIT variant: if panel group is vertical, use flex-col
        "data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  );
}

/**
 * ResizablePanel
 * Forwarding component for individual panels inside a group.
 */
function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

/**
 * ResizableHandle
 * Panel resize handle. Can optionally display a Grip icon.
 */
function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        // Base handle styling
        "bg-border relative flex w-px items-center justify-center " +
        "after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 " +
        "focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-none " + // fixed outline-hidden -> outline-none
        // Vertical layout adjustments
        "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full " +
        "data-[panel-group-direction=vertical]:after:left-0 " +
        "data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full " +
        "data-[panel-group-direction=vertical]:after:-translate-y-1/2 " +
        "data-[panel-group-direction=vertical]:after:translate-x-0 " +
        // Rotate child div if panel group is vertical
        "[&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          {/* Grip icon for handle */}
          {/* Replaced size-2.5 with w-2.5 h-2.5 to comply with Tailwind */}
          <GripVerticalIcon className="w-2.5 h-2.5" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
