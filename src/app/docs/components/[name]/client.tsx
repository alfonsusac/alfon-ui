"use client"

import { CollapsibleChevronIcon } from "@/app/icons"
import { cn } from "lazy-cn"
import { Fragment, useState, type ComponentProps, type ReactNode } from "react"

export function ComponentExampleItem(props: {
  name: string,
  description?: string,
  jsx: ReactNode,
  sourceCode?: ReactNode,
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex flex-col border border-current/10">

      <div className="flex flex-col sm:grid grid-cols-[1fr_3fr] gap-x-2">

        <div className="min-w-0 p-2">
          <h3 className="m-0! leading-4! text-base! text-current mt-2!">{props.name}</h3>
          <p className="m-0! text-xs! mt-2!">{props.description}</p>
        </div>

        <PreviewCard className={cn(
        )}>
          {props.jsx}
        </PreviewCard>

      </div>

      <div className="min-w-0">


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
  )
}



export function PreviewCard(props: ComponentProps<"div">) {
  return (
    <div {...props} className={cn(
      "@container/main",
      "grow py-10 px-4 border-current/10 overflow-hidden",
      "flex flex-col @lg/main:flex-row items-center justify-center gap-3 flex-wrap",
      "font-sans text-foreground text-base",
      props.className,
    )} />
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