export const description = "Input label component with various sizes and states."


// <Source>
import { cn } from "lazy-cn";
import type { ComponentProps } from "react";

export function Label({
  className,
  sm, lg, xl,
  ...props
}: ComponentProps<"label"> & {
  children?: React.ReactNode,
  sm?: boolean, lg?: boolean, xl?: boolean,
}) {
  return (
    <label {...props} className={cn(
      "text-xs font-medium my-1.5 block",
      className,
    )} />
  )
}
// </Source>
