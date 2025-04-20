import { Slot } from "@radix-ui/react-slot";
import { cn } from "lazy-cn";
import type { ComponentProps } from "react";

export function Button({
  className,
  asChild,
  primary,
  icon,
  ...props
}: ComponentProps<"button"> & {
  asChild?: boolean;
  primary?: boolean;
  icon?: boolean;
}) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp {...props} className={cn(
      "px-3 rounded-md flex items-center leading-none text-nowrap",
      "font-semibold",
      "text-sm",
      "tracking-tight",

      "cursor-pointer",

      "transition-[translate]",
      "active:translate-y-0.5",

      // Variants
      "hover:bg-foreground/5",
      primary && "bg-primary text-background",
      icon && "p-2",

      // Sizes
      "h-8",

      className,
    )} />
  )
}