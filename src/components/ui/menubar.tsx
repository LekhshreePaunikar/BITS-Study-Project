"use client";
import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar"; // Correct import

import { cn } from "./utils"; // Adjust the path as needed to your cn utility

// If you don't have a cn utility, you can define this simple one:
// function cn(...classes: (string | undefined)[]) {
//   return classes.filter(Boolean).join(" ");
// }

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground " +
        "data-[variant=destructive]:text-destructive " +
        "data-[variant=destructive]:focus:bg-destructive/10 " +
        "dark:data-[variant=destructive]:focus:bg-destructive/20 " +
        "data-[variant=destructive]:focus:text-destructive " +
        "[&_svg]:text-muted-foreground relative flex cursor-default items-center gap-2 " +
        "rounded-sm px-2 py-1.5 text-sm outline-none select-none " +
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50 " +
        "data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:w-4 [&_svg]:h-4",
        className
      )}
      {...props}
    />
  );
}

export { MenubarItem };