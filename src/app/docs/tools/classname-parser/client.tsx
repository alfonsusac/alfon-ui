"use client"

import { Input } from "@/lib/components/input"
import { parseTailwindClass } from "@/lib/css-graph"
import { Fragment, useState } from "react"

export function ClassNameParserClient() {

  const [input, setInput] = useState("")

  const parsedlist = (() => {
    return input.trim().split(/\s+/).map(input => {
      try {
        return { res: parseTailwindClass(input), error: undefined }
      } catch (error) {
        return { res: undefined, error: String(error) }
      }
    })
  })()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex">
        <Input value={input} onChange={e => setInput(e.currentTarget.value)} />
      </div>

      <div className="py-4">
        <span className="font-bold text-xs text-muted/50">INPUT</span>
        <div className="tracking-tighter text-muted/50 whitespace-pre-wrap flex flex-wrap gap-x-2">
          {
            parsedlist.map((parsed, i) => {
              if (!parsed.res) {
                return <span key={i} className="">
                  {input.split(/\s+/)[i]}
                </span>
              }
              return (
                <div key={i}>
                  {parsed.res.variants.map((v, i) => {
                    return <Fragment key={i}>
                      <span className="text-muted/75 italic">{v}</span>:
                    </Fragment>
                  })}
                  <span className="text-muted/90 font-semibold">
                    {parsed.res.utility}
                  </span>
                  {parsed.res.modifier
                    ? <Fragment>
                      /
                      <span className="text-blue-700/75 ">
                        {parsed.res.modifier}
                      </span>
                    </Fragment>
                    : null}
                  <span> </span>
                </div>
              )
            })
          }
        </div>
      </div>


      <div className="flex flex-col gap-[1px]">
        {parsedlist.map((parsed, i) => {
          return (
            <div className="card text-sm">
              <div className="text-xs uppercase font-bold tracking-tighter text-muted/50">class #{i + 1}</div>
              {
                parsed.res ? (
                  <div key={i} className="grid grid-cols-[6rem_1fr]">
                    {
                      parsed.res.variants.length > 0 && <>
                        <div className="text-muted/25">variants :</div>
                        <div>{parsed.res.variants.join(', ')}</div>
                      </>
                    }
                    <div className="text-muted/25">utility :</div>
                    <div>{parsed.res.utility}</div>
                    {
                      parsed.res.modifier && <>
                        <div className="text-muted/25">modifier :</div>
                        <div>{parsed.res.modifier}</div>
                      </>
                    }
                  </div>
                ) : (
                  <div className="text-red-500/70 font-medium">
                    {parsed.error}
                  </div>
                )
              }
            </div>
          )
        })}
      </div>

    </div>
  )
}