"use client"

import { Slot } from "@radix-ui/react-slot"
import { useState, type ReactNode } from "react"

export function ExpandableFolder(props: {
  opened: ReactNode,
  closed: ReactNode,
}) {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <Slot onClick={() => setIsOpen(!isOpen)}>
      {isOpen ? props.opened : props.closed}
    </Slot>
  )
}