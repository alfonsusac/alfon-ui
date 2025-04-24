export const description = "Input Base is a base component for all input fields. It is used in the Input, Textarea, and Select components. It is also used in the Button component to create a button with an input field inside it. It is a simple component that can be used to create a variety of input fields.";
export const utilityUsed = [
  "input-base",
]

import type { ComponentExamplesEntries } from "@/app/docs/components/[name]/page";
// <Source>
import { cn } from "lazy-cn";
import type { ComponentProps, SVGProps } from "react";
import { Input } from "./input";
import { Button } from "./button";

export function InputBase({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div {...props} className={cn(
      "input-base",
      "text-sm",
      "flex grow items-stretch",
      "[&_svg]:shrink-0",
      "[&_svg]:self-center",
      "[&_svg]:text-muted",
      "overflow-clip",
      "*:first:pl-(--input-px)",
      "*:last:pr-(--input-px)",
      "*:flex",
      "*:items-center",
      className,
    )} />
  )
}
// </Source>

export const Examples: ComponentExamplesEntries = [
  {
    name: "Normal",
    description: "A normal input field.",
    advanced: true,
    jsx: <div className="flex grow max-w-xs">
      {/* Preview=Normal */}
      <InputBase>
        <Input bare placeholder="Email" />
      </InputBase>
      {/* End Preview=Normal */}
    </div>
  },
  {
    name: "Error",
    description: "An input field with an error state.",
    advanced: true,
    jsx: <div className="flex grow max-w-xs">
      {/* Preview=Error */}
      <InputBase>
        <Input bare aria-invalid placeholder="Email" />
      </InputBase>
      {/* End Preview=Error */}
    </div>
  },
  {
    name: "Adornment",
    description: "An input field with an adornment.",
    advanced: true,
    jsx: <div className="flex flex-col gap-4 grow max-w-2xs">
      {/* Preview=Adornment */}
      <InputBase>
        <Input bare placeholder="Domain" />
        <div className="text-muted px-(--input-px)">
          kg
        </div>
      </InputBase>
      <InputBase>
        <Input bare placeholder="Domain" />
        <div className="text-muted bg-foreground/5 px-2 border-l border-foreground/5">
          @alfon.dev
        </div>
      </InputBase>
      <InputBase>
        <div>
          <LucideSearch className="" />
        </div>
        <Input bare placeholder="Search" />
        <div>
          <LucideX className="" />
        </div>
      </InputBase>
      {/* End Preview=Adornment */}
    </div>
  },
  {
    name: "Prompt Input",
    description: "An input field with a prompt.",
    advanced: true,
    jsx: <div className="flex grow max-w-xs">
      {/* Preview=Prompt Input */}
      <InputBase className="flex-col">
        <Input bare placeholder="How can I help you today?" />
        <div className="flex flex-row gap-1 p-2">
          <Button sm icon>Gemini 2.0 Flash <LucideChevronDown/></Button>
          <div className="grow"/>
          <Button sm icon><LucidePaperclip /></Button>
          <Button sm icon outline><LucideArrowUp /></Button>
        </div>
      </InputBase>
      {/* End Preview=Prompt Input */}
    </div>
  }
]


export function LucideSearch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Lucide by Lucide Contributors - https://github.com/lucide-icons/lucide/blob/main/LICENSE */}<g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21l-4.3-4.3"></path></g></svg>
  )
}
export function LucideX(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Lucide by Lucide Contributors - https://github.com/lucide-icons/lucide/blob/main/LICENSE */}<path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 6L6 18M6 6l12 12"></path></svg>
  )
}
export function LucideArrowUp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Lucide by Lucide Contributors - https://github.com/lucide-icons/lucide/blob/main/LICENSE */}<path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 12l7-7l7 7m-7 7V5"></path></svg>
  )
}
export function LucidePaperclip(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Lucide by Lucide Contributors - https://github.com/lucide-icons/lucide/blob/main/LICENSE */}<path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.234 20.252L21 12.3M16 6l-8.414 8.586a2 2 0 0 0 0 2.828a2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656a4 4 0 0 0-5.656 0l-8.415 8.585a6 6 0 1 0 8.486 8.486"></path></svg>
  )
}
export function LucideChevronDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Lucide by Lucide Contributors - https://github.com/lucide-icons/lucide/blob/main/LICENSE */}<path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 9l6 6l6-6"></path></svg>
  )
}