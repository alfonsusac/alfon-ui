"use client"

import type { SVGProps } from "react"
import { Button } from "./button"

export function CopyCodeButton(props: {
  data: string
}) {
  return (
    <Button
      className="absolute top-0 right-0 rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out"
      onClick={() => {
        navigator.clipboard.writeText(props.data)
      }}
    >
      <MaterialSymbolsContentCopyOutlineSharp />
    </Button>
  )
}

function MaterialSymbolsContentCopyOutlineSharp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M7 18V2h13v16zm2-2h9V4H9zm-6 6V6h2v14h11v2zm6-6V4z"></path></svg>
  )
}