"use client"

import { Button } from "@/lib/components/button"
import { useState } from "react"


type Token = {
  id: string,
  name: string,
  value: any,
}

export function DesignSystemMakerClientPage() {

  const [tokens, setTokens] = useState<Token[]>([])

  return (
    <div className="flex flex-col">
      {
        tokens.map(e => {
          return <></>
        })
      }
      <Button onClick={t => setTokens(p => [...p])} className="hover:bg-current/5">
        + Add Token
      </Button>
    </div>
  )
} 