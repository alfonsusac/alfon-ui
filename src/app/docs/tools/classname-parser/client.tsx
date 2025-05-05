"use client"

import { Input } from "@/lib/components/input"
import { analyzeArbitrary } from "@/lib/tw/arbitrary"
// import { getVariableUsedFromRoughParse } from "@/lib/tw/parse-class"
import { roughParseClassname } from "@/lib/tw/parse-class-rough"
import { parseUtility } from "@/lib/tw/utilities"
import { createVariantTree, type Variant } from "@/lib/tw/variants"
import { cn } from "lazy-cn"
import { Fragment, useRef, useState, type ComponentProps, type ReactNode } from "react"

export function ClassNameParserClient() {

  const [input, setInput] = useState(
    [
      "bg-red-500/(--eee,--asdf,___var_(--a-123,__ar(--b)),_var(--c_a)])",
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
    return input ? input.trim().split(/\s+/).map(input => {
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
    }) : undefined
  })()

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const inputDisplayRef = useRef<HTMLDivElement>(null)



  return (
    <div className="flex flex-col gap-8 wrap-anywhere">

      <div className="flex">
        <Input value={input} onChange={e => setInput(e.currentTarget.value)} />
      </div>

      {parsedlist?.length && <>

        <div className="flex flex-col gap-px tracking-tighter">
          <div className="font-bold text-xs text-muted/50 pb-2">INPUT {parsedlist?.length && <>({parsedlist?.length} classes)</>}</div>

          <div className="flex flex-col gap-4 ">
            {parsedlist.map((parsed, i) =>
              <div key={i} className="text-sm outline outline-border/50 shadow-sm">

                <div className="flex gap-2 pb-3 p-2">
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
                    <div className="flex flex-col">
                      {parsed.res.parsed.variants.length > 0 &&

                        <div className="flex gap-2 items-baseline bg-foreground/5 p-2 outline outline-border">
                          <div className="text-muted/50 font-bold text-xs uppercase tracking-tighter whitespace-pre pl-2 w-18">
                            variants:
                          </div>{' '}<div className="text-foreground flex flex-col gap-px bg-background">
                            {parsed.res.parsed.variants.map((v, i) => {
                              const parsedVariant = createVariantTree(v)
                              return <div key={i} className="flex flex-col gap-2">
                                <div className="text-[0.8rem] whitespace-pre flex flex-col  items-start">
                                  <VariantDetailPill variant={parsedVariant} />
                                </div>
                              </div>
                            })}
                          </div>
                        </div>
                      }

                      <div className="flex gap-2 items-baseline bg-foreground/5 p-2 outline outline-border mt-px">
                        {parsed.res.parsed.utility && <>
                          <div className="text-muted/50 font-bold text-xs uppercase tracking-tighter whitespace-pre pl-2 w-18">
                            utility:
                          </div>
                          {' '}
                          <div className="text-foreground bg-background">
                            {(() => {
                              const utility = parseUtility(parsed.res.parsed.utility)
                              return <div className="flex gap-px text-xs h-full">
                                <div className="p-0.5 px-2 outline outline-border self-stretch flex flex-col gap-0.5">
                                  {utility.prefix}
                                  {utility.type.includes('default')
                                    ? <SmallPill className="mb-1">Default</SmallPill>
                                    : <SmallPill className="mb-1">Custom</SmallPill>}
                                </div>
                                {utility.param && <div className="p-0.5 px-2 outline outline-border flex flex-col gap-0.5">
                                  {utility.param}
                                  {utility.type.includes('arbitrary')
                                    && <SmallPill className="mb-1">Arbitrary</SmallPill>}
                                  {/* {utility.potentialThemeTokens?.map(tt => {
                                    return <SmallPill key={tt} className="last:mb-1">{tt}</SmallPill>
                                  })} */}
                                </div>}
                                {utility.modifier && <div className="p-0.5 px-2 outline outline-border">{utility.modifier}</div>}
                                {parsed.res.parsed.modifier && <div className="p-0.5 px-2 outline outline-border">
                                  <span className="opacity-50">/</span>
                                  {parsed.res.parsed.modifier}
                                </div>}
                              </div>
                            })()}
                          </div>
                        </>
                        }
                      </div>

                      <div className="flex gap-2 items-baseline bg-foreground/5 p-2 outline outline-border mt-px">
                        <div className="text-muted/50 font-bold text-xs uppercase tracking-tighter whitespace-pre pl-2 w-52">
                          Potential Css Variables Used:
                        </div>
                        <div className="text-foreground flex flex-col gap-px bg-background">

                          {/* Loop cssvarsused */}
                          <>
                            {(() => {
                              const utility = parseUtility(parsed.res.parsed.utility)
                              // const cssVarsUsed = getVariableUsedFromRoughParse(parsed.res.parsed, utility)
                              // return cssVarsUsed.map((v, i) => {
                              //   return <div key={i} className="p-0.5 px-2 outline outline-border self-stretch flex flex-col gap-0.5 text-xs">{v}</div>
                              // })
                            })()}
                          </>


                        </div>
                      </div>

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

      </>}
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
  return (
    <div className="flex items-center p-1 px-1.5 leading-3 outline outline-border gap-1 self-stretch 
    backdrop-[asdf] backdrop-(--hello)">
      {props.variant.nested
        ? <>
          {props.variant.prefix}

        </>
        : <>
          {props.variant.full}
          {
            props.variant.type === "full arbitrary variant" && <div className="text-[0.6rem] p-0.5 px-1.5 rounded-md bg-muted/15 leading-3">Full Arbitrary</div>
          }
          {
            props.variant.type === "custom variant" && <div className="text-[0.6rem] p-0.5 px-1.5 rounded-md bg-muted/15 leading-3">Custom</div>
          }
        </>
      }
      {props.variant.nested
        ? <>
          <VariantDetailPill variant={props.variant.params} />
        </>
        : null
      }
      {
        props.variant.modifier && <span>
          <span className="text-orange-500">
            /
          </span>
          <span className="tracking-tighter">
            {props.variant.modifier}
          </span>
        </span>
      }
    </div>
  )
}

function SmallPill(props: ComponentProps<"div">) {
  return (
    <div {...props} className={cn(
      "text-[0.6rem] p-0.5 px-1.5 rounded-md bg-muted/15 leading-3 self-start text-nowrap",
      props.className
    )} />
  )
}