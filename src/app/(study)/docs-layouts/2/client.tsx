"use client"

import { Button } from "@/lib/components/button"
import { LucideChevronDown } from "@/lib/components/input-base"
import { cn } from "lazy-cn"
import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps, type SVGProps } from "react"
import { createPortal } from "react-dom"


function useHoveredElementState() {
  const hoveredSet = useRef(new Set<HTMLElement>).current
  const clearHoveredElements = () => {
    hoveredSet.forEach(el => delete el.dataset.designToolHover)
    hoveredSet.clear()
  }
  const addHoveredElement = (el: HTMLElement) => {
    hoveredSet.add(el)
    el.dataset.designToolHover = ''
  }
  const setHoveredElement = (el: HTMLElement) => {
    hoveredSet.forEach(el => delete el.dataset.designToolHover)
    hoveredSet.clear()
    hoveredSet.add(el)
    el.dataset.designToolHover = ''
  }
  return {
    clear: clearHoveredElements,
    add: addHoveredElement,
    set: setHoveredElement,
  }
}
function useHoverElementsUnderCursor(cb: (els: HTMLElement[]) => void, deps: any[]) {
  useEffect(() => {
    const hnadleMouseMove = (e: MouseEvent) => {
      const hoveredElements = document
        .elementsFromPoint(e.clientX, e.clientY)
        .filter(el => el instanceof HTMLElement) as HTMLElement[]
      cb(hoveredElements)
    }
    document.addEventListener('mousemove', hnadleMouseMove)
    document.addEventListener('wheel', hnadleMouseMove)
    return () => {
      document.removeEventListener('mousemove', hnadleMouseMove)
      document.removeEventListener('wheel', hnadleMouseMove)
    }
  }, deps)
}


export function DesignDevtool() {

  const hoveredElement = useHoveredElementState()
  // Handle Mouse Hover
  useHoverElementsUnderCursor(hoveringElements => {
    const hoveringTooltip = !!hoveringElements.find(el => el instanceof HTMLElement && el.classList.contains('design-tooltip'))
    if (hoveringTooltip) {
      hoveredElement.clear()
      return
    }
    if (hoveringElements[0] instanceof HTMLElement === false) return
    hoveredElement.set(hoveringElements[0])
  }, [])


  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null)
  // Handle Mouse Click
  useEffect(() => {
    const handleMouseClick = (e: MouseEvent) => {
      // Later: only handle if "design mode" is enabled
      const elementsUnder = document.elementsFromPoint(e.clientX, e.clientY)
      const tooltipClicked = !!elementsUnder.find((el) => {
        return el instanceof HTMLElement && el.classList.contains('design-tooltip')
      })
      if (tooltipClicked) return

      const el = e.target
      if (el instanceof HTMLElement === false) return
      selectElement(el)
    }
    document.addEventListener("click", handleMouseClick)
    return () => document.removeEventListener("click", handleMouseClick)
  }, [selectedElement])

  // Handle Selected Element Change
  const selectElement = (el: HTMLElement | null) => {
    delete selectedElement?.dataset.designToolSelected
    setSelectedElement(el)
    if (!el) return
    el.dataset.designToolSelected = ''
  }




  if (typeof document === 'undefined') return null

  return createPortal(
    <TooltipPortal
      targetElement={selectedElement}
      onTargetElementChange={selectElement}
      onTargetHovered={el => {
        if (el instanceof HTMLElement === false) return
        hoveredElement.set(el)
      }}
    />
    , document.body, 'design-tool-tooltip'
  )
}




function TooltipPortal(props: {
  targetElement: HTMLElement | null
  onTargetElementChange?: (el: HTMLElement | null) => void
  onTargetHovered?: (el: HTMLElement | null) => void
}) {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const verticalPaddingTopRef = useRef<HTMLDivElement>(null)
  const verticalPaddingBottomRef = useRef<HTMLDivElement>(null)

  const [targetData, setTargetData] = useState<
    {
      tagName: string
      rect: DOMRect
      computedStyle: CSSStyleDeclaration,
      computedStyleMap: StylePropertyMapReadOnly,

      isParentFlexOrGrid: boolean,
      propertyValue: {
        right: string,
        bottom: string,
        left: string,
        top: string,
        width: string,
        height: string,
      },

    }
  >()

  const tooltipPosition = useRef({ x: undefined as undefined | number }).current

  // Find out about its data. (Delegate data extraction to this component.)
  useLayoutEffect(() => {
    if (!props.targetElement || !tooltipRef.current || !verticalPaddingTopRef.current) return
    // Before: save tooltip position for animation
    const tooltip = tooltipRef.current
    const tooltipRect = tooltip.getBoundingClientRect()
    tooltipPosition.x = tooltipRect.left


    // Save targetElement Data
    const rect = props.targetElement.getBoundingClientRect()
    const parent = props.targetElement.parentElement
    verticalPaddingTopRef.current.style.height = `${ rect.top }px`
    setTargetData({
      tagName: props.targetElement.tagName.toLowerCase(),
      rect: rect,
      computedStyle: window.getComputedStyle(props.targetElement),
      isParentFlexOrGrid: parent ? ['flex', 'grid'].includes(window.getComputedStyle(parent).display) : false,
      computedStyleMap: props.targetElement.computedStyleMap(),
      propertyValue: {
        right: props.targetElement.computedStyleMap().get('right')?.toString() ?? '',
        bottom: props.targetElement.computedStyleMap().get('bottom')?.toString() ?? '',
        left: props.targetElement.computedStyleMap().get('left')?.toString() ?? '',
        top: props.targetElement.computedStyleMap().get('top')?.toString() ?? '',
        width: props.targetElement.computedStyleMap().get('width')?.toString() ?? '',
        height: props.targetElement.computedStyleMap().get('height')?.toString() ?? '',
      }
    })
  }, [props.targetElement])

  useLayoutEffect(() => {
    if (!props.targetElement || !tooltipRef.current) return
    const rect = props.targetElement.getBoundingClientRect()
    const tooltip = tooltipRef.current

    // Only update Horizontal position we use vertical padding to move the tooltip up and down
    tooltip.style.left = `${ rect.right + 10 }px`
    tooltip.style.right = ''

    // Collision Detection
    const tooltipRect = tooltip.getBoundingClientRect()
    if (tooltipRect.right > window.innerWidth) {
      tooltip.style.left = ``
      tooltip.style.right = `${ window.innerWidth - rect.left + 10 }px`
    }
    // Clamp tooltip position to viewport
    const newTooltipRect = tooltip.getBoundingClientRect()
    if (newTooltipRect.left < 0) {
      tooltip.style.left = `0px`
      tooltip.style.right = ``
    }
    if (newTooltipRect.right > window.innerWidth) {
      tooltip.style.right = `0px`
      tooltip.style.left = ``
    }

    // Animate horizontal position using FLIP
    const finalRect = tooltip.getBoundingClientRect()
    if (tooltipPosition.x === undefined) return
    const delta = finalRect.left - tooltipPosition.x
    console.log(delta)
    requestAnimationFrame(() => {
      tooltip.animate([
        { transform: `translateX(${ delta * -1 }px)` },
        { transform: `translateX(0px)` },
      ], {
        duration: 200,
        easing: 'ease-in-out',
        fill: 'both',
      })
    })


  }, [targetData])

  // Later: update tooltip position on scroll
  // Later: update tooltip position on resize

  if (!props.targetElement) return null

  return <div
    ref={tooltipRef}
    className="fixed top-0 h-screen max-w-80 z-[999] text-nowrap flexcol-0/stretch overflow-hidden pointer-events-none"
  >
    <div ref={verticalPaddingTopRef} className="transition-all duration-200 shrink-999999" /> {/* Dont forget to pointer-event-none later */}
    {// State Conditionals needs to be put here to be reactive. Putting outside of the component will not work.
      targetData ? <div className="flexcol-2/stretch p-2 min-h-0">
        <div className="design-tooltip overflow-clip bg-neutral-800 py-3.5 [&>div]:px-4 rounded-lg flexcol-3/stretch **:border-neutral-600 border-t min-h-0 pointer-events-auto">
          <div className="leading-3 text-sm font-medium ">
            {targetData.tagName}{' '}
            <div className="inline-flex self-start text-xs leading-3! p-1 px-2 font-semibold bg-white/10 rounded-lg">
              {targetData.computedStyle.display}
            </div>{' '}
            {
              targetData.computedStyle.position !== 'static' && <div className="inline-flex self-start text-xs leading-3! p-1 px-2 font-semibold bg-white/10 rounded-lg">
                {targetData.computedStyle.position}
              </div>
            }
          </div>
          <hr />
          <div className="relative -mt-3 pt-3 px-0! flex-1 min-h-0 flexcol">
            <div className="absolute z-10 top-0 w-full h-3 bg-gradient-to-t from-transparent to-neutral-800" />
            <div className="flex-1 min-h-0 overflow-auto px-4 -my-3 py-3">
              <div className="flexcol-2/stretch text-xs relative">
                <div className="text-xs font-medium">
                  Layout
                </div>
                {/* Width & Height */}
                <div className="tooltip-details grid grid-cols-2 gap-1 ">
                  <div className="flexcol-center h-16 bg-white/5 px-2 pr-3 rounded-sm leading-3">
                    <div className="flexrow-2/center h-5">
                      <div className="text-center text-white/50 w-3">W</div>
                      <div className="">
                        <Value defaultIf="auto">
                          {formatString(targetData.computedStyleMap.get('width')?.toString())}
                        </Value>
                      </div>
                    </div>
                    <div className="flexrow-2/center h-5">
                      <div className="text-center text-white/50 w-3 rotate-90"><AkarIconsAlignToMiddle /></div>
                      <div className=""><Value defaultIf="auto">{formatString(targetData.computedStyle.minWidth)}</Value></div>
                    </div>
                    <div className="flexrow-2/center h-5">
                      <div className="text-center text-white/50 w-3"><UilArrowsShrinkH /></div>
                      <div className=""><Value defaultIf="none">{formatString(targetData.computedStyle.maxWidth)}</Value></div>
                    </div>
                  </div>
                  <div className="flexcol-center h-16 bg-white/5 px-2 pr-3 rounded-sm leading-3">
                    <div className="flexrow-2/center h-5">
                      <div className="text-center text-white/50 w-3">H</div>
                      <div className="">
                        <Value defaultIf="auto">
                          {formatString(targetData.computedStyleMap.get('height')?.toString())}
                        </Value>
                      </div>
                    </div>
                    <div className="flexrow-2/center h-5">
                      <div className="text-center text-white/50 w-3"><AkarIconsAlignToMiddle /></div>
                      <div className=""><Value defaultIf="auto">{targetData.computedStyle.minHeight.replace('px', '')}</Value></div>
                    </div>
                    <div className="flexrow-2/center h-5">
                      <div className="text-center text-white/50 w-3 rotate-90"><UilArrowsShrinkH /></div>
                      <div className=""><Value defaultIf="none">{targetData.computedStyle.maxHeight.replace('px', '')}</Value></div>
                    </div>
                  </div>
                </div>

                {/* Margin & Padding & Dimension */}
                <div className="grid grid-cols-[1fr_1fr_min-content_1fr_1fr] grid-rows-5 *:flexrow-center/center text-xs text-center bg-white/5 p-1 rounded-lg">

                  <div className=" text-white/50 self-start">m</div>
                  <div />
                  <div>
                    <Value defaultIf="0">
                      {targetData.computedStyle.marginTop.replace('px', '')}
                    </Value>
                  </div>
                  <div />
                  <div />

                  <div />
                  <div className="border-t border-l text-white/50">p</div>
                  <div className="border-t">
                    <Value defaultIf="0">
                      {targetData.computedStyle.paddingTop.replace('px', '')}
                    </Value>
                  </div>
                  <div className="border-t border-r" />
                  <div />

                  <div className="mx-1">
                    <Value defaultIf="0">
                      {targetData.computedStyle.marginLeft.replace('px', '')}
                    </Value>
                  </div>
                  <div className="border-l">
                    <Value defaultIf="0">
                      {targetData.computedStyle.paddingLeft.replace('px', '')}
                    </Value>
                  </div>
                  <div className="opacity-25 px-2 py-1 gap-1">
                    {formatNumber(targetData.rect.width)} <span className="text-[0.8em]">✕</span> {formatNumber(targetData.rect.height)}
                  </div>
                  <div className="border-r">
                    <Value defaultIf="0">
                      {targetData.computedStyle.paddingRight.replace('px', '')}
                    </Value>
                  </div>
                  <div>
                    <Value defaultIf="0">
                      {targetData.computedStyle.marginRight.replace('px', '')}
                    </Value>
                  </div>

                  <div />
                  <div className="border-b border-l" />
                  <div className="border-b">
                    <Value defaultIf="0">
                      {targetData.computedStyle.paddingBottom.replace('px', '')}
                    </Value>
                  </div>
                  <div className="border-b border-r" />
                  <div />

                  <div />
                  <div />
                  <div>
                    <Value defaultIf="0">
                      {targetData.computedStyle.marginBottom.replace('px', '')}
                    </Value>
                  </div>
                  <div />
                  <div />
                </div>

                {targetData.computedStyle.position !== "static" && <>
                  <div className="flexcol-1">
                    <div className="grid grid-cols-[1fr_2fr_1fr] self-stretch">
                      <div className="self-center h-6 p-2 pr-3 bg-white/5 rounded-sm flexrow-2/center col-start-2">
                        <div className="opacity-75">T</div>
                        <div className=""><Value defaultIf="auto">{targetData.propertyValue.top.replace('px', '')}</Value></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-[1fr_1fr] gap-1 self-stretch">
                      <div className="self-center h-6 p-2 pr-3 bg-white/5 rounded-sm flexrow-2/center">
                        <div className="opacity-75">L</div>
                        <div className=""><Value defaultIf="auto">{targetData.propertyValue.left}</Value></div>
                      </div>
                      <div className="self-center h-6 p-2 pr-3 bg-white/5 rounded-sm flexrow-2/center">
                        <div className="opacity-75">R</div>
                        <div className=""><Value defaultIf="auto">{targetData.propertyValue.right}</Value></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-[1fr_2fr_1fr] self-stretch">
                      <div className="self-center h-6 p-2 pr-3 bg-white/5 rounded-sm flexrow-2/center col-start-2">
                        <div className="opacity-75">B</div>
                        <div className=""><Value defaultIf="auto">{targetData.propertyValue.bottom}</Value></div>
                      </div>
                    </div>
                  </div>
                </>}



                {/* Flex */}
                {
                  targetData.computedStyle.display === 'flex' && <div className="flexrow-2">
                    <div className="grid grid-cols-3 grid-rows-3 text-xs text-center bg-white/5 p-2 rounded-lg self-start relative group"
                    >
                      <div className="size-6 flexcol-center/center"><div className="size-1 rounded-full bg-white/10" /></div>
                      <div className="size-6 flexcol-center/center"><div className="size-1 rounded-full bg-white/10" /></div>
                      <div className="size-6 flexcol-center/center"><div className="size-1 rounded-full bg-white/10" /></div>
                      <div className="size-6 flexcol-center/center"><div className="size-1 rounded-full bg-white/10" /></div>
                      <div className="size-6 flexcol-center/center"><div className="size-1 rounded-full bg-white/10" /></div>
                      <div className="size-6 flexcol-center/center"><div className="size-1 rounded-full bg-white/10" /></div>
                      <div className="size-6 flexcol-center/center"><div className="size-1 rounded-full bg-white/10" /></div>
                      <div className="size-6 flexcol-center/center"><div className="size-1 rounded-full bg-white/10" /></div>
                      <div className="size-6 flexcol-center/center"><div className="size-1 rounded-full bg-white/10" /></div>
                      {targetData.computedStyle.flexDirection === "column" &&
                        <div className="absolute h-full w-0 border-l border-neutral-500! left-1/2">
                          <div className="size-2 origin-bottom-right border-b border-r border-neutral-500! absolute bottom-0 right-0 -translate-x-[0.5px] rotate-45" />
                        </div>
                      }
                      {targetData.computedStyle.flexDirection === "row" &&
                        <div className="absolute w-full h-0 border-t border-neutral-500! top-1/2">
                          <div className="size-2 origin-bottom-right border-b border-r border-neutral-500! absolute bottom-0 right-0 -translate-x-[0.5px] -rotate-45" />
                        </div>
                      }
                      <div className="absolute inset-0 p-2 flex gap-0.5"
                        style={{
                          flexDirection: targetData.computedStyle.flexDirection as any,
                          justifyContent: targetData.computedStyle.justifyContent,
                          alignItems: targetData.computedStyle.alignItems,
                        }}
                      >
                        <div className="min-h-6 min-w-6 flex items-center justify-center gap-0.5"
                          style={{
                            flexDirection: targetData.computedStyle.flexDirection as any,
                            alignItems: targetData.computedStyle.alignItems,
                            justifyContent: targetData.computedStyle.justifyContent,
                            width: ['space-around', 'space-between', 'space-evenly', 'stretch'].includes(targetData.computedStyle.justifyContent) ? '100%' : 'unset',
                            padding: ['space-around', 'space-between', 'space-evenly', 'stretch'].includes(targetData.computedStyle.justifyContent) ? '0' : '0.5rem',
                          }}
                        >
                          <div className="rounded-full bg-blue-400" style={['row', 'row-reverse'].includes(targetData.computedStyle.flexDirection) ? { minHeight: '0.6rem', width: '0.15rem' } : { minWidth: '0.6rem', height: '0.15rem' }} />
                          <div className="rounded-full bg-blue-400" style={['row', 'row-reverse'].includes(targetData.computedStyle.flexDirection) ? { minHeight: '0.8rem', width: '0.15rem' } : { minWidth: '0.8rem', height: '0.15rem' }} />
                          <div className="rounded-full bg-blue-400" style={['row', 'row-reverse'].includes(targetData.computedStyle.flexDirection) ? { minHeight: '0.4rem', width: '0.15rem' } : { minWidth: '0.4rem', height: '0.15rem' }} />
                        </div>
                      </div>
                    </div>
                    <div className="flexcol-2/stretch flex-1">
                      <div className="flexrow-2/center h-6 bg-white/5 px-2 pr-3 rounded-sm leading-3">
                        <div className="text-center text-white/50"><LucideAlignHorizontalSpaceAround /></div>
                        <div>
                          <Value defaultIf="normal">
                            {targetData.computedStyle.rowGap.replace('px', '')}
                          </Value>
                        </div>
                      </div>
                      <div className="flexrow-2/center h-6 bg-white/5 px-2 pr-3 rounded-sm leading-3">
                        <div className="text-center text-white/50"><LucideAlignVerticalSpaceAround /></div>
                        <div>
                          <Value defaultIf="normal">
                            {targetData.computedStyle.columnGap.replace('px', '')}
                          </Value>
                        </div>
                      </div>
                    </div>
                  </div>
                }
                {
                  // Later: Grid
                }
                {
                  targetData.isParentFlexOrGrid && <>
                    <div className="px-2 h-7 rounded-md flexrow-3/center bg-white/5 text-center">
                      <div className="opacity-75">flex</div>
                      <div className="flexrow-2/center">
                        <Value defaultIf="0">{targetData.computedStyle.flexGrow}</Value>
                        <Value defaultIf="1">{targetData.computedStyle.flexShrink}</Value>
                        <Value defaultIf="auto">{targetData.computedStyle.flexBasis}</Value>
                      </div>
                    </div>
                  </>
                }
                <div className="px-2 h-7 rounded-md flexrow-3/center bg-white/5 text-center">
                  <div className="opacity-75">z-index</div>
                  <div className="flexrow-2/center">
                    <Value defaultIf="auto">{targetData.computedStyle.zIndex}</Value>
                  </div>
                </div>
                {/* 
                <div className="px-2 rounded-md bg-black/10 py-2 min-h-20 min-w-0 overflow-x-auto font-mono text-[0.9em]">
                  {props.targetElement.outerHTML}
                </div> */}
              </div>
            </div>
            <div className="absolute z-10 -bottom-3 w-full h-3 bg-gradient-to-b from-transparent to-neutral-800" />
          </div>
        </div>
        <TraversalCard
          targetElement={props.targetElement}
          onTargetElementChange={props.onTargetElementChange}
          onTargetHovered={props.onTargetHovered}
        />
      </div> : null
    }
  </div>
}

function TraversalCard(props: {
  targetElement: HTMLElement
  onTargetElementChange?: (el: HTMLElement | null) => void
  onTargetHovered?: (el: HTMLElement | null) => void
}) {
  const parent = props.targetElement.parentElement instanceof HTMLElement ? props.targetElement.parentElement : null
  const firstChildren = props.targetElement.firstElementChild instanceof HTMLElement ? props.targetElement.firstElementChild : null
  const previousSibling = props.targetElement.previousElementSibling instanceof HTMLElement ? props.targetElement.previousElementSibling : null
  const nextSibling = props.targetElement.nextElementSibling instanceof HTMLElement ? props.targetElement.nextElementSibling : null

  const [minimapOpen, setMinimapOpen] = useState(false)

  return (
    <div className="flexrow relative design-tooltip pointer-events-auto">
      <div className="flex-1 min-w-0 bg-neutral-800 shrink-0 p-1.5 rounded-lg flexcol/stretch **:border-neutral-600 flex-1 min-h-0 border-t">
        <div className="leading-3 flexrow-space-between">
          <div className="flexrow">
            <Button icon xs className="hover:bg-white/5" disabled={!parent}
              onClick={(e) => {
                e.stopPropagation()
                props.onTargetElementChange?.(parent)
              }}>
              <MaterialSymbolsFullscreen />
            </Button>
            <Button icon xs className="hover:bg-white/5" disabled={!firstChildren}
              onClick={(e) => {
                e.stopPropagation()
                props.onTargetElementChange?.(firstChildren)
              }}>
              <MaterialSymbolsCloseFullscreen />
            </Button>
            <Button icon xs className="hover:bg-white/5" disabled={!previousSibling}
              onClick={(e) => {
                e.stopPropagation()
                props.onTargetElementChange?.(previousSibling)
              }}>
              <TablerArrowLeft />
            </Button>
            <Button icon xs className="hover:bg-white/5" disabled={!nextSibling}
              onClick={(e) => {
                e.stopPropagation()
                props.onTargetElementChange?.(nextSibling)
              }}>
              <TablerArrowRight />
            </Button>
          </div>
          <div>
            <Button icon xs className={cn("hover:bg-white/5", minimapOpen && "rotate-180")} onClick={() => setMinimapOpen(!minimapOpen)}>
              <LucideChevronDown />
            </Button>
          </div>
        </div>
        <div className="transition-all duration-500 grid grid-rows-[0fr] data-open:grid-rows-[1fr] overflow-clip" data-open={minimapOpen ? "" : undefined}>
          <div className="min-h-0">
            <ElementMiniMinimap
              currentElement={props.targetElement}
              onClick={(e) => props.onTargetElementChange?.(e)}
              onHover={(e) => props.onTargetHovered?.(e)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ElementBadge({ className, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} className={cn("h-5 flexrow-0/center rounded-md px-1.5 select-none", className)} />
  )
}
function ElementBadgeButton(props: {
  className?: string,
  element: HTMLElement,
  onClick?: (e: HTMLElement) => void,
  onHover?: (e: HTMLElement) => void,
  selected?: boolean,
}) {
  // Find index of children this element currently is
  const parentElement = props.element.parentElement
  const siblings = parentElement?.children
  const index = siblings ? [...siblings].indexOf(props.element) : -1

  const children = props.element.children
  const firstChildren = children[0] instanceof HTMLElement ? children[0] : null

  return (
    <>
      <ElementBadge className={cn("hover:bg-white/10 cursor-pointer overflow-hidden data-selected:bg-blue-500/30 group", props.className)}
        data-selected={props.selected}
        onClick={(e) => {
          e.stopPropagation()
          !props.selected && props.onClick?.(props.element)
        }}
        onMouseMove={(e) => {
          e.stopPropagation()
          props.onHover?.(props.element)
        }}
      >
        <span className="opacity-25 mr-1 text-[0.9em] mb-[1px] inline-block">{index}</span>
        {props.element.tagName.toLowerCase()}
        <span className={cn(props.selected ? "text-blue-400" : "text-neutral-600")}>{[...props.element.classList.values()].map((c => `.${ c }`))}</span>
      </ElementBadge>
      {firstChildren && props.selected
        && <ElementBadgeButton
          element={firstChildren}
          className="pl-6"
          onClick={props.onClick}
          onHover={props.onHover}
        />}

    </>
  )
}

function ElementMiniMinimap(props: {
  currentElement: HTMLElement,
  onClick?: (e: HTMLElement) => void,
  onHover?: (e: HTMLElement) => void,
}) {
  const parentElement = props.currentElement.parentElement
  const firstElement = parentElement?.firstElementChild instanceof HTMLElement ? parentElement?.firstElementChild : null
  const lastElement = parentElement?.lastElementChild instanceof HTMLElement ? parentElement?.lastElementChild : null
  const currentElement = props.currentElement

  const previousElement = currentElement.previousElementSibling instanceof HTMLElement ? currentElement.previousElementSibling : null
  const nextElement = currentElement.nextElementSibling instanceof HTMLElement ? currentElement.nextElementSibling : null

  const previousPreviousElement = previousElement?.previousElementSibling instanceof HTMLElement ? previousElement.previousElementSibling : null
  const nextNextElement = nextElement?.nextElementSibling instanceof HTMLElement ? nextElement.nextElementSibling : null

  const hasPreviousEllipsis = previousPreviousElement !== firstElement && previousElement !== firstElement && previousElement
  const hasNextEllipsis = nextNextElement !== lastElement && nextElement !== lastElement && nextElement

  const firstNotPrevElement = (firstElement !== previousElement && firstElement !== currentElement) ? firstElement : null
  const lastNotNextElement = (lastElement !== nextElement && lastElement !== currentElement) ? lastElement : null

  return (
    <div className="flexcol-0 rounded-md text-xs leading-3 contain-inline-size items-stretch font-mono tracking-tighter">
      {
        parentElement
          ? <ElementBadgeButton element={parentElement} onClick={props.onClick} onHover={props.onHover} />
          : <ElementBadge className="opacity-25" >root</ElementBadge>
      }
      {
        firstNotPrevElement
        && <ElementBadgeButton element={firstNotPrevElement} className="pl-4" onClick={props.onClick} onHover={props.onHover} />
      }
      {
        hasPreviousEllipsis
        && <ElementBadge className="pl-4 bg-transparent opacity-25 h-3">...</ElementBadge>
      }
      {
        previousElement
        && <ElementBadgeButton element={previousElement} className="pl-4" onClick={props.onClick} onHover={props.onHover} />
      }
      {
        currentElement
        && <ElementBadgeButton element={currentElement} className="pl-4" selected onClick={props.onClick} onHover={props.onHover} />
      }
      {
        nextElement
        && <ElementBadgeButton element={nextElement} className="pl-4" onClick={props.onClick} onHover={props.onHover} />
      }
      {
        hasNextEllipsis
        && <ElementBadge className="pl-4 bg-transparent opacity-25 h-3">...</ElementBadge>
      }
      {
        lastNotNextElement
        && <ElementBadgeButton element={lastNotNextElement} className="pl-4" onClick={props.onClick} onHover={props.onHover} />
      }
    </div>
  )

}



function Value(props: {
  children?: string,
  defaultIf: string,
}) {
  if (props.children === props.defaultIf) return <span className="opacity-25">{props.children}</span>
  return <>{props.children}</>
}
function formatNumber(n: number) {
  return n % 1 === 0 ? n.toString() : n.toFixed(1);
}
function formatString(str?: string) {
  return str?.replace(/px/g, '') ?? ''
}

export function LucideAlignHorizontalSpaceAround(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Lucide by Lucide Contributors - https://github.com/lucide-icons/lucide/blob/main/LICENSE */}<g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><rect width="6" height="10" x="9" y="7" rx="2"></rect><path d="M4 22V2m16 20V2"></path></g></svg>
  )
}
export function LucideAlignVerticalSpaceAround(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Lucide by Lucide Contributors - https://github.com/lucide-icons/lucide/blob/main/LICENSE */}<g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><rect width="10" height="6" x="7" y="9" rx="2"></rect><path d="M22 20H2M22 4H2"></path></g></svg>
  )
}

export function MaterialSymbolsFullscreen(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M3 21v-5h2v3h3v2zm13 0v-2h3v-3h2v5zM3 8V3h5v2H5v3zm16 0V5h-3V3h5v5z"></path></svg>
  )
}
export function MaterialSymbolsCloseFullscreen(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M3.4 22L2 20.6L8.6 14H4v-2h8v8h-2v-4.6zM12 12V4h2v4.6L20.6 2L22 3.4L15.4 10H20v2z"></path></svg>
  )
}
export function TablerArrowLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Tabler Icons by Paweł Kuna - https://github.com/tabler/tabler-icons/blob/master/LICENSE */}<path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12l6 6m-6-6l6-6"></path></svg>
  )
}
export function TablerArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Tabler Icons by Paweł Kuna - https://github.com/tabler/tabler-icons/blob/master/LICENSE */}<path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-6 6l6-6m-6-6l6 6"></path></svg>
  )
}
export function AkarIconsAlignToMiddle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Akar Icons by Arturo Wibawa - https://github.com/artcoholic/akar-icons/blob/master/LICENSE */}<g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2"><path d="M21 12H3"></path><path strokeLinejoin="round" d="M12 2v6m0 14v-6M9 5l3 3l3-3M9 19l3-3l3 3"></path></g></svg>
  )
}
export function TablerArrowBarBoth(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Tabler Icons by Paweł Kuna - https://github.com/tabler/tabler-icons/blob/master/LICENSE */}<path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12H2m3 3l-3-3l3-3m17 3h-6m3 3l3-3l-3-3m-7-5v16"></path></svg>
  )
}
export function UilArrowCompressH(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Unicons by Iconscout - https://github.com/Iconscout/unicons/blob/master/LICENSE */}<path fill="currentColor" d="M12 5a1 1 0 0 0-1 1v12a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1m-1.29 6.29l-2.5-2.5a1 1 0 1 0-1.42 1.42l.8.79H3a1 1 0 0 0 0 2h4.59l-.8.79a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0l2.5-2.5a1 1 0 0 0 .21-.33a.94.94 0 0 0 0-.76a1 1 0 0 0-.21-.33M21 11h-4.59l.8-.79a1 1 0 0 0-1.42-1.42l-2.5 2.5a1 1 0 0 0 0 1.42l2.5 2.5a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42l-.8-.79H21a1 1 0 0 0 0-2"></path></svg>
  )
}
export function UilArrowsV(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Unicons by Iconscout - https://github.com/Iconscout/unicons/blob/master/LICENSE */}<path fill="currentColor" d="M15.29 16.29L13 18.59V5.41l2.29 2.3a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42l-4-4a1 1 0 0 0-.33-.21a1 1 0 0 0-.76 0a1 1 0 0 0-.33.21l-4 4a1 1 0 1 0 1.42 1.42L11 5.41v13.18l-2.29-2.3a1 1 0 1 0-1.42 1.42l4 4a1 1 0 0 0 .33.21a.94.94 0 0 0 .76 0a1 1 0 0 0 .33-.21l4-4a1 1 0 0 0-1.42-1.42"></path></svg>
  )
}
export function UilArrowsH(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Unicons by Iconscout - https://github.com/Iconscout/unicons/blob/master/LICENSE */}<path fill="currentColor" d="M21.92 11.62a1 1 0 0 0-.21-.33l-4-4a1 1 0 1 0-1.42 1.42l2.3 2.29H5.41l2.3-2.29a1 1 0 1 0-1.42-1.42l-4 4a1 1 0 0 0-.21.33a1 1 0 0 0 0 .76a1 1 0 0 0 .21.33l4 4a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42L5.41 13h13.18l-2.3 2.29a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0l4-4a1 1 0 0 0 .21-.33a1 1 0 0 0 0-.76"></path></svg>
  )
}
export function UilArrowsHAlt(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Unicons by Iconscout - https://github.com/Iconscout/unicons/blob/master/LICENSE */}<path fill="currentColor" d="M21.92 11.62a1 1 0 0 0-.21-.33l-2.5-2.5a1 1 0 0 0-1.42 1.42l.8.79H14a1 1 0 0 0 0 2h4.59l-.8.79a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0l2.5-2.5a1 1 0 0 0 .21-.33a1 1 0 0 0 0-.76M10 11H5.41l.8-.79a1 1 0 0 0-1.42-1.42l-2.5 2.5a1 1 0 0 0-.21.33a1 1 0 0 0 0 .76a1 1 0 0 0 .21.33l2.5 2.5a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42l-.8-.79H10a1 1 0 0 0 0-2"></path></svg>
  )
}
export function UilArrowsMerge(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Unicons by Iconscout - https://github.com/Iconscout/unicons/blob/master/LICENSE */}<path fill="currentColor" d="m10.71 11.29l-2.5-2.5a1 1 0 1 0-1.42 1.42l.8.79H4V7a1 1 0 0 0-2 0v10a1 1 0 0 0 2 0v-4h3.59l-.8.79a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0l2.5-2.5a1 1 0 0 0 .21-.33a1 1 0 0 0 0-.76a1 1 0 0 0-.21-.33M21 6a1 1 0 0 0-1 1v4h-3.59l.8-.79a1 1 0 0 0-1.42-1.42l-2.5 2.5a1 1 0 0 0-.21.33a1 1 0 0 0 0 .76a1 1 0 0 0 .21.33l2.5 2.5a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42l-.8-.79H20v4a1 1 0 0 0 2 0V7a1 1 0 0 0-1-1"></path></svg>
  )
}
export function UilArrowsShrinkH(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Unicons by Iconscout - https://github.com/Iconscout/unicons/blob/master/LICENSE */}<path fill="currentColor" d="m17.71 11.29l-2.5-2.5a1 1 0 0 0-1.42 1.42l.8.79H9.41l.8-.79a1 1 0 0 0-1.42-1.42l-2.5 2.5a1 1 0 0 0-.21.33a1 1 0 0 0 0 .76a1 1 0 0 0 .21.33l2.5 2.5a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42l-.8-.79h5.18l-.8.79a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0l2.5-2.5a1 1 0 0 0 .21-.33a1 1 0 0 0 0-.76a1 1 0 0 0-.21-.33M3 6a1 1 0 0 0-1 1v10a1 1 0 0 0 2 0V7a1 1 0 0 0-1-1m18 0a1 1 0 0 0-1 1v10a1 1 0 0 0 2 0V7a1 1 0 0 0-1-1"></path></svg>
  )
}
export function UilArrowsShrinkV(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Unicons by Iconscout - https://github.com/Iconscout/unicons/blob/master/LICENSE */}<path fill="currentColor" d="M13.79 10.21a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42l-2.5-2.5a1 1 0 0 0-.33-.21a1 1 0 0 0-.76 0a1 1 0 0 0-.33.21l-2.5 2.5a1 1 0 0 0 1.42 1.42l.79-.8v5.18l-.79-.8a1 1 0 0 0-1.42 1.42l2.5 2.5a1 1 0 0 0 .33.21a.94.94 0 0 0 .76 0a1 1 0 0 0 .33-.21l2.5-2.5a1 1 0 0 0-1.42-1.42l-.79.8V9.41ZM7 4h10a1 1 0 0 0 0-2H7a1 1 0 0 0 0 2m10 16H7a1 1 0 0 0 0 2h10a1 1 0 0 0 0-2"></path></svg>
  )
}