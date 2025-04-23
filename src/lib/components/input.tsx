

export const description = "Input is a UI element that allows users to enter data. It can be a text field, checkbox, radio button, or any other type of input element. Inputs are essential for collecting user information and are often used in forms."
export const utilityUsed = [
  "input-base",
]

export const Preview = <div className="max-w-2xs flex grow">
  <Input placeholder="John Doe" />
</div>


// <Source>
import { cn } from "lazy-cn";
import type { ComponentProps } from "react";

const inputBaseClassNames = cn(
  "grow",
  "outline outline-border rounded-md",
  "text-sm [--p:calc(var(--spacing)*2)] [--px:calc(var(--spacing)*3)]",
  "transition-[outline,box-shadow]",
  "[--input-shadow:inset_0_1px_3px_-1px_var(--color-border)]",
  "shadow-[0_0_0_0px_var(--color-border),_var(--input-shadow)]",
)

export function Input({
  className,
  ...props
}: ComponentProps<"input"> & {
  children?: React.ReactNode,
}) {
  return (
    <input {...props} className={cn(
      "p-(--p) px-(--px)",
      inputBaseClassNames,
      !props['aria-invalid'] && [
        "focus:shadow-[0_0_0_4px_var(--color-border),_var(--input-shadow)]",
        "hover:outline-primary/50",
      ],
      props.disabled && [
        "bg-foreground/5",
        "pointer-events-none",
        "opacity-75",
      ],
      props['aria-invalid'] && [
        "outline-destructive",
        "shadow-[0_0_0_4px_var(--color-destructive-focus),_var(--input-shadow)]",
      ],
      className,
    )} />
  )
}
// </Source>

import type { ComponentExamplesEntries } from "@/app/docs/components/[name]/page";
export const Examples: ComponentExamplesEntries = [
  {
    name: "Disabled",
    description: "A disabled input field.",
    jsx: <div className="flex grow max-w-xs">
      {/* Preview=Disabled */}
      <Input disabled placeholder="Email" />
      {/* End Preview=Disabled */}
    </div>
  },
  {
    name: "Error",
    description: "An input field with an error state.",
    jsx: <div className="flex grow max-w-xs">
      {/* Preview=Error */}
      <Input aria-invalid placeholder="Email" />
      {/* End Preview=Error */}
    </div>
  }
]