export const description = "Input Base is a base component for all input fields. It is used in the Input, Textarea, and Select components. It is also used in the Button component to create a button with an input field inside it. It is a simple component that can be used to create a variety of input fields.";


// <Source>
import { cn } from "lazy-cn";
import type { ComponentProps } from "react";

export function InputBase({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div {...props} className={cn(
      "grow",
      
    )} />
  )
}
// </Source>
