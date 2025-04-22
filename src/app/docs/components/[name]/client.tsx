"use client"

import { CollapsibleChevronIcon } from "@/app/icons"
import { cn } from "lazy-cn"
import { Fragment, useState, type ReactNode } from "react"

export function ComponentExampleItem(props: {
  name: string,
  description?: string,
  jsx: ReactNode,
  sourceCode?: ReactNode,
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <h3 className="m-0! leading-4! text-base! text-current mt-2!">{props.name}</h3>
      <p className="m-0! text-xs! mb-4! mt-1!">{props.description}</p>
      <div className="border border-current/10">
        <div className={cn(
          "grow py-10 border-b-current/10 overflow-hidden",
          "flex items-center justify-center",
          "font-sans text-foreground text-base"
        )}>
          {props.jsx}
        </div>
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
          <div className="min-h-0">
            <div className="border-b-0 border-t border-current/10">
              {props.sourceCode}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}