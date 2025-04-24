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
  sm, lg, xl,
  ...props
}: ComponentProps<"div"> & {
  sm?: boolean, lg?: boolean, xl?: boolean,
}) {
  return (
    <div {...props} className={cn(
      "input-base",
      "text-sm",
      "flex grow items-center",
      "overflow-clip",
      // "px-(--input-px)",
      "[:where(&>*:first-child)]:pl-(--input-px)",
      "[:where(&>*:last-child)]:pr-(--input-px)",
      "[:where(&>*)]:flex",
      "[:where(&>*)]:items-center",
      // "has-[.input-lg]:text-base",
      // "has-[.input-xl]:text-base",
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
        <div className="pr-(--input-px) text-muted px-(--input-px)">
          kg
        </div>
      </InputBase>
      <InputBase>
        <Input bare placeholder="Domain" />
        <div className="pr-(--input-px) self-stretch text-muted bg-foreground/5 px-2 border-l border-foreground/5">
          @alfon.dev
        </div>
      </InputBase>
      <InputBase className="rounded-full">
        <div className="text-muted">
          <MaterialSymbolsSearch className="size-5" />
        </div>
        <Input bare placeholder="Search" />
        <Button sm icon round className="text-muted mr-1">
          <LucideX />
        </Button>
      </InputBase>
      {/* End Preview=Adornment */}
    </div>
  },
  {
    name: "Prompt Input",
    description: "An input field with a prompt.",
    advanced: "inspiration",
    fullWidth: true,
    jsx: <div className="flex grow max-w-md">
      {/* Preview=Prompt Input */}
      <InputBase className="flex-col items-stretch">
        <Input bare placeholder="Ask v0 to build..." />
        <div className="flex gap-1.5 p-(--input-px) items-end">
          <Button xs subtle>Gemini 2.0 Flash <LucideChevronDown /></Button>
          <div className="grow" />
          <Button xs icon><LucidePaperclip /></Button>
          <Button xs icon primary><LucideArrowUp /></Button>
        </div>
      </InputBase>
      {/* End Preview=Prompt Input */}
    </div>
  },
  {
    name: "Search Input",
    description: "An input field with a search icon.",
    advanced: "inspiration",
    fullWidth: true,
    jsx: <div className="flex grow max-w-lg">
      {/* Preview=Search Input */}
      <InputBase className="rounded-full h-11">
        <Button icon sm round className="ml-2">
          <MaterialSymbolsMenuRounded className="text-muted" />
        </Button>
        <Input bare placeholder="Search posts" className="h-full" />
        <div className="pr-2 ">
          <Button icon sm round>
            <MaterialSymbolsRefresh className="text-muted" />
          </Button>
          <Button icon sm round>
            <MaterialSymbolsSearch className="text-muted" />
          </Button>
          <Button icon sm round>
            <LucideSettings className="text-muted" />
          </Button>
        </div>
      </InputBase>
      {/* End Preview=Search Input */}
    </div>
  }
]



export function MaterialSymbolsSearch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="m19.6 21l-6.3-6.3q-.75.6-1.725.95T9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l6.3 6.3zM9.5 14q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"></path></svg>
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

export function MaterialSymbolsMenuRounded(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M4 18q-.425 0-.712-.288T3 17t.288-.712T4 16h16q.425 0 .713.288T21 17t-.288.713T20 18zm0-5q-.425 0-.712-.288T3 12t.288-.712T4 11h16q.425 0 .713.288T21 12t-.288.713T20 13zm0-5q-.425 0-.712-.288T3 7t.288-.712T4 6h16q.425 0 .713.288T21 7t-.288.713T20 8z"></path></svg>
  )
}
export function LucideSettings(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Lucide by Lucide Contributors - https://github.com/lucide-icons/lucide/blob/main/LICENSE */}<g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2"></path><circle cx="12" cy="12" r="3"></circle></g></svg>
  )
}

export function MaterialSymbolsRefresh(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M12 20q-3.35 0-5.675-2.325T4 12t2.325-5.675T12 4q1.725 0 3.3.712T18 6.75V4h2v7h-7V9h4.2q-.8-1.4-2.187-2.2T12 6Q9.5 6 7.75 7.75T6 12t1.75 4.25T12 18q1.925 0 3.475-1.1T17.65 14h2.1q-.7 2.65-2.85 4.325T12 20"></path></svg>
  )
}