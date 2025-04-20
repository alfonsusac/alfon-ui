"use client"

import { Slot } from "@radix-ui/react-slot";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

export function ExpandableFolder(props: {
  defaultOpened?: boolean,
  target: ReactNode,
  content: ReactNode,
}) {
  const [isOpen, setIsOpen] = useState(props.defaultOpened ?? true)

  return (
    <>
      <Slot data-opened={isOpen ? "" : undefined}
        onClick={() => setIsOpen(!isOpen)} >
        {props.target}
      </Slot>
      {isOpen && (
        props.content
      )}
    </>
  )
}

export function SelectablePageItem(props: {
  children: ReactNode,
  path: string
}) {
  const path = usePathname()
  const isSelected = path === props.path
  return (
    <Slot aria-current={isSelected ? "page" : undefined}>
      {props.children}
    </Slot>
  )

}
