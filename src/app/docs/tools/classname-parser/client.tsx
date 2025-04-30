"use client"

import { Input } from "@/lib/components/input"
import { roughParseClassname } from "@/lib/tw/parse-class-rough"
import { parseVariant, type Variant } from "@/lib/tw/variants"
import { Fragment, useRef, useState, type ReactNode } from "react"

export function ClassNameParserClient() {

  const [input, setInput] = useState(
    [
      "not-not-group-peer-has-not-in-data-asdf:[&.is-dragging]:group-has-[a]:bg-red-500/123",
      "group-data-[hello]/edit:bg-red-500",
      'dark:md:hover:bg-fuchsia-600',
      'group-hover/edit:translate-x-0.5 group-hover/edit:text-gray-500 group-[:nth-of-type(3)_&]:block',
      "peer-checked/published:block",
      "after:content-['*'] *:border-sky-100",
      "[&.is-dragging]:active:cursor-grabbing",
      "nth-3:mx-6 nth-[3n+1]:mx-7",
      'nth-last-of-type-6:underline',
      'dark:odd:bg-gray-900/50 dark:even:bg-gray-950',
      'dark:has-checked:ring-indigo-900',
      'group-has-[a]:block',
      'peer-has-checked:hidden',
      'hover:not-focus:bg-indigo-700',
    ].join(' ')
  )

  const parsedlist = (() => {
    return input.trim().split(/\s+/).map(input => {
      try {
        return {
          res: {
            parsed: roughParseClassname(input),
          }, error: undefined,
          input,
        }
      } catch (error) {
        return { res: undefined, error: String(error), input }
      }
    })
  })()

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const inputDisplayRef = useRef<HTMLDivElement>(null)



  return (
    <div className="flex flex-col gap-8 wrap-anywhere">

      <div className="flex">
        <Input value={input} onChange={e => setInput(e.currentTarget.value)} />
      </div>

      <div>
        <div className="font-bold text-xs text-muted/50 pb-2">INPUT ({parsedlist.length} classes)</div>
        <div
          ref={inputDisplayRef}
          className="tracking-tighter text-muted/50 whitespace-pre-wrap flex flex-col gap-x-2">
          {parsedlist.map((parsed, i) =>
            <div key={i}>
              <HighlightedClassname
                parsed={parsed.res?.parsed}
                fallback={parsed.input}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-px tracking-tighter">
        {parsedlist.map((parsed, i) =>
          <div key={i} className="text-sm card">
            <div className="flex gap-2 pb-3">
              <span className="uppercase font-bold tracking-tighter text-muted/50 shrink-0">
                #{i + 1}
              </span>
              <div className="font-bold!">
                <HighlightedClassname
                  parsed={parsed.res?.parsed}
                  fallback={parsed.input}
                />
              </div>
            </div>
            {parsed.res
              ? (
                <div className="items-center">
                  {parsed.res.parsed.variants.length > 0 && <div className="flex gap-2 items-baseline">
                    <div className="text-muted/50 font-bold text-xs uppercase tracking-tighter whitespace-pre">
                      variants:
                    </div>{' '}<div className="text-foreground flex flex-col gap-px">
                      {parsed.res.parsed.variants.map((v, i) => {
                        const parsedVariant = parseVariant(v)
                        return <div key={i} className="flex flex-col gap-2 card p-2">
                          <div className="font-medium">{v}</div>
                          <div className="text-[0.8rem] whitespace-pre flex flex-col  items-start">
                            {/* {JSON.stringify(parsedVariant, null, 2)} */}
                            <VariantDetailPill variant={parsedVariant} />
                          </div>
                        </div>
                      })}
                    </div>
                  </div>}
                  <div className="flex gap-2 items-baseline">

                    <div className="text-muted/50 font-bold text-xs uppercase tracking-tighter whitespace-pre">
                      utility:
                    </div>{' '}<div className="text-foreground">
                      {parsed.res.parsed.utility}
                    </div>
                  </div>
                  {parsed.res.parsed.modifier && <div className="flex gap-2 items-baseline">
                    <div className="text-muted/50 font-bold text-xs uppercase tracking-tighter whitespace-pre">
                      modifier:
                    </div>{' '}<div>
                      {parsed.res.parsed.modifier}
                    </div>
                  </div>}
                </div>
              ) : (
                <div className="text-red-500/70 font-medium ">
                  {parsed.error}
                </div>
              )}
          </div>
        )}
      </div>

    </div>
  )
}


function UnhighlightedClassname(props: { children: ReactNode }) {
  return <span className="text-muted/50">{props.children}</span>
}
function HighlightedClassname(props: {
  parsed?: ReturnType<typeof roughParseClassname>,
  fallback: string
}) {
  const { parsed, fallback } = props
  if (!parsed) {
    return <UnhighlightedClassname>{fallback}</UnhighlightedClassname>
  }

  const { variants, utility, modifier } = parsed
  return (
    <>
      {variants.map((variant, i) =>
        <Fragment key={i}>
          <span className="italic tracking-tighter text-foreground">
            {variant}
          </span>
          <span className="text-orange-500">
            :
          </span>
        </Fragment>)}

      <span className="text-foreground tracking-tighter">{utility}</span>

      {modifier && <>
        <span className="text-orange-500">
          /
        </span>
        <span className="text-blue-700/75  tracking-tighter">
          {modifier}
        </span>
      </>}
    </>
  )
}

function VariantDetailPill(props: {
  variant: Variant,
}) {
  if (props.variant.type === "full arbitrary variant") return (
    <div className="flex">
      <div className="text-[0.6rem] p-0.5 px-1.5 rounded-md bg-muted/20 leading-3 mb-1">Full Arbitrary Variant</div>
    </div>
  )
  return (
    <div className="flex flex-col p-1 leading-3 rounded-md outline outline-border gap-1">
      {props.variant.nested
        ? <>
          {props.variant.prefix}

        </>
        : <>
          {props.variant.full}
        </>
      }
      <div className="flex">
        <div className="text-[0.6rem] p-0.5 px-1.5 rounded-md bg-muted/20 leading-3 mb-1">{props.variant.type}</div>
      </div>
      {props.variant.nested
        ? <>
          <VariantDetailPill variant={props.variant.params} />
        </>
        : null
      }
    </div>
  )
}