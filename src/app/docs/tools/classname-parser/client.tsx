"use client"

import { Input } from "@/lib/components/input"
import { parseTailwindClass } from "@/lib/css-graph"
import { useState } from "react"

export function ClassNameParserClient() {

  const [input, setInput] = useState("")

  const parsed = (() => {
    try {
      return { res: parseTailwindClass(input), error: undefined }
    } catch (error) {
      return { res: undefined, error: String(error) }
    }
  })()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex">
        <Input value={input} onChange={e => setInput(e.currentTarget.value)} />
      </div>

      <div>
        {parsed.res ? (
          <div>
            {JSON.stringify(parsed.res)}
          </div>
        ) : (
          <div className="bg-red-500/50">
            {parsed.error}
          </div>
        )}
      </div>
    </div>
  )
}