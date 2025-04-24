export const description = "Input is a UI element that allows users to enter data. It can be a text field, checkbox, radio button, or any other type of input element."
export const utilityUsed = [
  "input-base",
]

export const Preview = <div className="max-w-2xs flex grow">
  <Input placeholder="John Doe" />
</div>


// <Source>
import { cn } from "lazy-cn";
import type { ComponentProps } from "react";

export function Input({
  className,
  bare,
  sm, lg, xl,
  ...props
}: ComponentProps<"input"> & {
  children?: React.ReactNode,
  bare?: boolean,
  sm?: boolean, lg?: boolean, xl?: boolean,
}) {
  return (
    <input {...props} className={cn(
      "input-base",
      "grow min-w-0",
      "px-(--input-px)",
      "h-(--input-h)",
      bare && "outline-none shadow-none",
      sm && "h-(--input-h-sm) px-(--input-px-sm)",
      lg && "h-(--input-h-lg) px-(--input-px-lg) text-base",
      xl && "h-(--input-h-xl) px-(--input-px-xl) text-base",
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
  },
  {
    name: "Bare",
    description: "A bare input field.",
    jsx: <div className="flex grow max-w-xs">
      {/* Preview=Bare */}
      <Input bare placeholder="Email" />
      {/* End Preview=Bare */}
    </div>
  },
  {
    name: "Sizes",
    description: "Input field with different sizes.",
    jsx: <div className="flex flex-col gap-3 grow max-w-xs">
      {/* Preview=Sizes */}
      <Input placeholder="Email" sm />
      <Input placeholder="Email" />
      <Input placeholder="Email" lg />
      <Input placeholder="Email" xl />
      {/* End Preview=Sizes */}
    </div>
  }
]