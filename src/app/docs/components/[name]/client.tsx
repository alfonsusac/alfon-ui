"use client"

import { CollapsibleChevronIcon } from "@/app/icons"
import { cn } from "lazy-cn"
import { useState, type ComponentProps, type ReactNode } from "react"
import type { ComponentExamplesEntries } from "./page"

export function ComponentExampleItem(props: Omit<ComponentExamplesEntries[number], "sourceCode"> & {
  sourceCode: ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={cn(
      "flex flex-col gap-y-4 grid-cols-[2fr_5fr] gap-x-2",
      props.fullWidth ? "sm:flex-col" : "sm:grid",
    )}>

      <div className="min-w-0">
        <h3 className="m-0! leading-4! text-base! text-current mt-2!">{props.name}</h3>
        <p className="m-0! text-xs! mt-2!">{props.description}</p>
      </div>

      <div className="flex flex-col gap-x-2 border border-current/10">

        <PreviewCard>
          {props.jsx}
        </PreviewCard>

        <div className="min-w-0">
          {/* Show Code Button */}
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 bg-current/3 hover:bg-current/6 cursor-pointer select-none border-t border-current/10 flex items-center gap-1">
            <CollapsibleChevronIcon className={cn(
              "transition-transform",
              isOpen && "rotate-90",
            )} />
            <span className="text-xs">
              {isOpen ? "Hide Code" : "Show Code"}
            </span>
          </div>

          {/* Expandable Block */}
          <div className={cn(
            "overflow-clip transition-[grid-template-rows]",
            "grid grid-rows-[0fr]",
            isOpen && "grid-rows-[1fr]",
          )}>
            <div className="min-h-0 min-w-0">
              <div className="border-b-0 border-t border-current/10 flex flex-col">
                {props.sourceCode}
              </div>
            </div>
          </div>
        </div>

      </div>


    </div>
  )
}



export function PreviewCard(props: ComponentProps<"div">) {
  return (
    <div {...props} className={cn(
      "@container/previewcard",
      "grow py-10 px-4 border-current/10 overflow-hidden",
      "font-sans text-foreground text-base",
      props.className,
    )}>
      <div className="flex flex-col @xs/previewcard:flex-row items-center justify-center gap-3 flex-wrap">
        {props.children}
      </div>
    </div>
  )
}

export function CardTitleHintBoxThing(props: ComponentProps<"h3">) {
  return (
    <h3 {...props} className={cn(
      "text-[0.65rem]! m-0! font-medium! uppercase",
      "p-2 text-foreground/30",
      "bg-foreground/2",
      "border border-foreground/10 border-b-0",
      props.className
    )} />
  )
}