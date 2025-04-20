import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps } from "react";

export function Button({
  asChild,
  ...props
}: ComponentProps<"button"> & {
  asChild?: boolean;

}) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp {...props} />
  )
}