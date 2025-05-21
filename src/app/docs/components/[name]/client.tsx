"use client"

import { CollapsibleChevronIcon } from "@/app/icons"
import { cn } from "lazy-cn"
import { use, useState, type ComponentProps, type ReactNode } from "react"
import type { ComponentExamplesEntries } from "./page"
import { ThemePreviewContext } from "../../preview-theme"
import Head from "next/head"

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

      <div className="flex flex-col gap-x-2">

        <PreviewCard className="mb-2">
          {props.jsx}
        </PreviewCard>

        <div className="min-w-0">
          {/* Show Code Button */}
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-current/6 cursor-pointer select-none flex items-center gap-1">
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
              <div className="border-b-0 flex flex-col">
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
  const previewTheme = use(ThemePreviewContext)
  return (
    <div {...props}
      style={{
        ...previewTheme.getStyles()
      }}
      className={cn(
        "bg-(--color-background) rounded-lg",
        "@container/previewcard",
        "grow py-10 px-4 border-current/10 overflow-hidden",
        "font-sans text-(--color-foreground) text-base",
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
      "p-2",
      "bg-current/2",
      "border border-current/10 border-b-0",
      props.className
    )}>
      <span className="text-current/50">
        {props.children}
      </span>
    </h3>
  )
}