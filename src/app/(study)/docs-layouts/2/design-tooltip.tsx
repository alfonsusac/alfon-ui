"use client"

import { Button } from "@/lib/components/button"
import { LucideChevronDown } from "@/lib/components/input-base"
import Color from "colorjs.io"
import { cn } from "lazy-cn"
import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps, type JSX, type ReactNode, type SVGProps } from "react"
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


  // Find out about its data. (Delegate data extraction to this component.)
  useLayoutEffect(() => {
    if (!props.targetElement || !tooltipRef.current || !verticalPaddingTopRef.current) return

    // Save targetElement Data
    const rect = props.targetElement.getBoundingClientRect()
    const parent = props.targetElement.parentElement
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

  const tooltipWidth = 224
  const prevTooltipData = useRef({
    x: undefined as undefined | number,
    prevTarget: undefined as undefined | HTMLElement
  }).current

  useLayoutEffect(() => {
    if (!props.targetElement || !tooltipRef.current || !verticalPaddingTopRef.current) return
    const tooltip = tooltipRef.current

    // Before: save tooltip position for animation
    if (prevTooltipData.prevTarget !== undefined) {
      const tooltipRect = tooltip.getBoundingClientRect()
      prevTooltipData.x = tooltipRect.left
    }
    // Calculate next tooltip position
    const rect = props.targetElement.getBoundingClientRect()

    // Only update Horizontal position we use vertical padding to move the tooltip up and down
    let left = rect.right as number | undefined
    let right = undefined as number | undefined

    // Collision Detection
    if (rect.right + tooltipWidth > window.innerWidth) {
      left = undefined
      right = window.innerWidth - rect.left
      if (right + tooltipWidth > window.innerWidth) {
        left = 0
        right = undefined
      }
    }

    // Apply new position
    tooltip.style.left = left === undefined ? '' : `${ left }px`
    tooltip.style.right = right === undefined ? '' : `${ right }px`
    verticalPaddingTopRef.current.style.height = `${ rect.top }px`

    // Save tooltip data: Don't record the first time
    prevTooltipData.prevTarget = props.targetElement

    // Animate horizontal position using FLIP
    const finalRect = tooltip.getBoundingClientRect()
    if (prevTooltipData.x === undefined) return
    console.log('finalRect', finalRect, prevTooltipData.x)
    const delta = finalRect.left - prevTooltipData.x
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

  }, [props.targetElement])

  // Later: update tooltip position on scroll
  // Later: update tooltip position on resize


  if (!props.targetElement) return null

  return <div
    ref={tooltipRef}
    className="fixed top-0 h-screen z-[999] text-nowrap flexcol-0/stretch overflow-hidden pointer-events-none p-2"
    style={{
      width: tooltipWidth,
    }}
  >
    <div ref={verticalPaddingTopRef} className="transition-all duration-200 shrink-999999" />
    {// State Conditionals needs to be put here to be reactive. Putting outside of the component will not work.
      targetData &&
      <div className="flexcol-2/stretch min-h-0">
        <MainCard element={props.targetElement} />
        <TraversalCard
          targetElement={props.targetElement}
          onTargetElementChange={props.onTargetElementChange}
          onTargetHovered={props.onTargetHovered}
        />
      </div>
    }
  </div>
}

function MainCard(props: {
  element: HTMLElement
}) {
  const tagName = props.element.tagName.toLowerCase()
  const computedStyle = window.getComputedStyle(props.element)
  const computedStyleMap = props.element.computedStyleMap()
  const targetData = {
    tagName: tagName,
    rect: props.element.getBoundingClientRect(),
    computedStyle,
    computedStyleMap,
    isParentFlexOrGrid: props.element.parentElement ? ['flex', 'grid'].includes(window.getComputedStyle(props.element.parentElement).display) : false,
    propertyValue: {
      right: computedStyleMap.get('right')?.toString().replace('px', ''),
      bottom: computedStyleMap.get('bottom')?.toString().replace('px', ''),
      left: computedStyleMap.get('left')?.toString().replace('px', ''),
      top: computedStyleMap.get('top')?.toString().replace('px', ''),
      width: computedStyleMap.get('width')?.toString().replace('px', ''),
      height: computedStyleMap.get('height')?.toString().replace('px', ''),
    }
  }

  return (
    <div className="design-tooltip overflow-clip bg-neutral-800 py-3.5 pb-0 [&>div]:px-4 rounded-lg flexcol-0/stretch **:border-neutral-600 border-t min-h-0 pointer-events-auto">

      <div className="flexcol-2 pb-2">
        <div className="leading-3 text-sm font-medium ">
          {tagName}{' '}
          <div className="inline-flex self-start text-xs leading-3! p-1 px-2 font-semibold bg-white/10 rounded-lg">
            {computedStyle.display}
          </div>{' '}
          {
            computedStyle.position !== 'static' && <div className="inline-flex self-start text-xs leading-3! p-1 px-2 font-semibold bg-white/10 rounded-lg">
              {computedStyle.position}
            </div>
          }
        </div>
      </div>


      <hr className="border-neutral-700!" />
      <div className="relative px-0! py-0! flex-1 min-h-0 flexcol">
        <div className="absolute z-30 top-0 w-full h-3 bg-gradient-to-t from-transparent to-neutral-800 pointer-events-none" />

        <div className="flex-1 min-h-0 overflow-auto">


          <div className="flexcol-2/stretch relative p-3 text-xs">

            <ColorSection
              element={props.element}
              computedStyle={computedStyle}
              computedStyleMap={computedStyleMap}
            />

            <BorderSection
              element={props.element}
              computedStyle={computedStyle}
              computedStyleMap={computedStyleMap}
            />

            <TypographySection
              element={props.element}
              computedStyle={computedStyle}
              computedStyleMap={computedStyleMap}
            />

            <div className="opacity-25 -mb-1">
              Layout
            </div>

            {/* Width & Height */}
            <div className="grid grid-cols-2 gap-2">
              <Field className="grid grid-cols-[1rem_1fr] gap-1 gap-y-2">
                <div className="text-white/50">W</div>
                <Value val={formatString(targetData.computedStyleMap.get('height')?.toString())} defaultIf="auto" />

                <AkarIconsAlignToMiddle className="text-white/50 rotate-90" />
                <Value val={formatString(computedStyle.minHeight)} defaultIf="auto" />

                <UilArrowsShrinkH className="text-white/50" />
                <Value val={formatString(computedStyle.maxHeight)} defaultIf="none" />
              </Field>

              <Field className="grid grid-cols-[1rem_1fr] gap-1 gap-y-2">
                <div className="text-white/50">H</div>
                <Value val={formatString(targetData.computedStyleMap.get('width')?.toString())} defaultIf="auto" />

                <AkarIconsAlignToMiddle className="text-white/50" />
                <Value val={formatString(computedStyle.minHeight)} defaultIf="auto" />

                <UilArrowsShrinkV className="text-white/50" />
                <Value val={formatString(computedStyle.maxHeight)} defaultIf="none" />
              </Field>
            </div>

            {/* Margin & Padding & Dimension */}
            <Field className="grid grid-cols-[1fr_1fr_min-content_1fr_1fr] grid-rows-5 *:flexrow-center/center text-xs text-center bg-white/5 p-1 rounded-lg">

              {/* Row 1 */}
              <div className=" text-white/50 self-start">m</div>
              <div className="col-start-3"><Value val={targetData.computedStyle.marginTop.replace('px', '')} defaultIf="0" /></div>

              {/* Row 2 */}
              <div className="col-start-2 border-t border-l text-white/50">p</div>
              <div className="border-t"><Value val={targetData.computedStyle.paddingTop.replace('px', '')} defaultIf="0" /></div>
              <div className="border-t border-r" />

              {/* Row 3 */}
              <div className="mx-1 col-start-1"><Value val={targetData.computedStyle.marginLeft.replace('px', '')} defaultIf="0" /></div>
              <div className="border-l"><Value val={targetData.computedStyle.paddingLeft.replace('px', '')} defaultIf="0" /></div>
              <div className="opacity-25 px-2 py-1 gap-1">
                {formatNumber(targetData.rect.width)} <span className="text-[0.8em]">✕</span> {formatNumber(targetData.rect.height)}
              </div>
              <div className="border-r"><Value val={targetData.computedStyle.paddingRight.replace('px', '')} defaultIf="0" /></div>
              <div><Value val={targetData.computedStyle.marginRight.replace('px', '')} defaultIf="0" /></div>

              {/* Row 4 */}
              <div className="col-start-2 border-b border-l" />
              <div className="border-b"><Value val={targetData.computedStyle.paddingBottom.replace('px', '')} defaultIf="0" /></div>
              <div className="border-b border-r" />

              {/* Row 5 */}
              <div className="col-start-3"><Value val={targetData.computedStyle.marginBottom.replace('px', '')} defaultIf="0" /></div>
            </Field>

            {/* Relative Positioning */}
            {targetData.computedStyle.position !== "static" && <>
              <div className="flexcol-1">
                <div className="grid grid-cols-[1fr_2fr_1fr] self-stretch">
                  <div className="self-center h-6 p-2 pr-3 bg-white/5 rounded-sm flexrow-2/center col-start-2">
                    <div className="opacity-75">T</div>
                    <div className=""><Value defaultIf="auto">{targetData.propertyValue.top}</Value></div>
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
            {targetData.computedStyle.display === 'flex' &&
              <div className="flexrow-2">
                <Field className="contain-content grid grid-cols-3 grid-rows-3 text-xs text-center bg-white/5 p-2 rounded-lg self-start relative group">
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
                </Field>

                <div className="flexcol-2/stretch flex-1">
                  <Field className="flexrow-2/center h-6 bg-white/5 px-2 pr-3 rounded-sm leading-3">
                    <div className="text-center text-white/50"><LucideAlignHorizontalSpaceAround /></div>
                    <div>
                      <Value defaultIf="normal">
                        {targetData.computedStyle.rowGap.replace('px', '')}
                      </Value>
                    </div>
                  </Field>
                  <Field className="flexrow-2/center h-6 bg-white/5 px-2 pr-3 rounded-sm leading-3">
                    <div className="text-center text-white/50"><LucideAlignVerticalSpaceAround /></div>
                    <div>
                      <Value defaultIf="normal">
                        {targetData.computedStyle.columnGap.replace('px', '')}
                      </Value>
                    </div>
                  </Field>
                </div>
              </div>
            }
            {
              // Later: Grid
            }

            {/* Other Details */}
            {targetData.isParentFlexOrGrid && <>
              <Field className="px-2 h-7 rounded-md flexrow-3/center bg-white/5 text-center">
                <div className="opacity-75">flex</div>
                <div className="flexrow-2/center">
                  <Value defaultIf="0">{targetData.computedStyle.flexGrow}</Value>
                  <Value defaultIf="1">{targetData.computedStyle.flexShrink}</Value>
                  <Value defaultIf="auto">{targetData.computedStyle.flexBasis}</Value>
                </div>
              </Field>
            </>}
            <Field className="px-2 h-7 rounded-md flexrow-3/center bg-white/5 text-center">
              <div className="opacity-75">z-index</div>
              <div className="flexrow-2/center">
                <Value defaultIf="auto">{targetData.computedStyle.zIndex}</Value>
              </div>
            </Field>



          </div>
        </div>
        <div className="absolute z-30 bottom-0 w-full h-4 bg-gradient-to-b from-transparent to-neutral-800 pointer-events-none" />
      </div>
    </div>
  )
}

function ColorSection(props: {
  element: HTMLElement,
  computedStyle: CSSStyleDeclaration,
  computedStyleMap: StylePropertyMapReadOnly,
}) {
  const computedStyle = props.computedStyle
  const computedStyleMap = props.computedStyleMap

  const toFormattedHexColor = (colorstr: string) => {
    try {
      // Remove exponential notation
      const color = new Color(colorstr.replace(/-?\d+\.?\d*e[+-]?\d+/gi, num => Number(num).toFixed(6)))
      const hex = color.to('srgb').toString({ format: 'hex', collapse: false })
      const trimmed = hex.toUpperCase().replace('#', '')
      return {
        mainDisplay: trimmed.length === 8 && trimmed.endsWith('00') ? 'Transparent' : trimmed.slice(0, 6),
        hexAlpha: trimmed.length === 8 ? trimmed.slice(6, 8) : undefined,
        isTransparent: trimmed.length === 8 && trimmed.endsWith('00'),
        alphaPercent: color.alpha * 100,
        raw: colorstr,
      }
    } catch {
      return {
        raw: colorstr,
      }
    }
  }

  const displayedTextColor = toFormattedHexColor(computedStyle.color)
  const displayedBkgrColor = toFormattedHexColor(computedStyle.backgroundColor)

  return (
    <div className="flexcol-2/stretch text-xs">
      <Field className="grid grid-cols-[min-content_min-content_1fr_2rem] gap-1">
        <BiFonts className="text-white/50 mr-1" />
        <div className="size-3 border rounded-xs aspect-square" style={{ backgroundColor: computedStyle.color }} />
        {
          displayedTextColor.isTransparent
            ? <span className="text-neutral-500">Transparent</span>
            : <>
              <span className="">{displayedTextColor.mainDisplay}<span className="opacity-50">{displayedTextColor.hexAlpha}</span></span>
              <div className="text-end">{displayedTextColor.alphaPercent}%</div>
            </>
        }
      </Field>
      <Field className="grid grid-cols-[min-content_min-content_1fr_2rem] gap-1">
        <HugeiconsBackground className="text-white/50 mr-1" />
        <div className="size-3 border rounded-xs aspect-square" style={{ backgroundColor: computedStyle.backgroundColor }} />
        {
          displayedBkgrColor.isTransparent
            ? <span className="text-neutral-500">Transparent</span>
            : <>
              <span className="">{displayedBkgrColor.mainDisplay}<span className="opacity-50">{displayedBkgrColor.hexAlpha}</span></span>
              <div className="text-end">{displayedBkgrColor.alphaPercent}%</div>
            </>
        }
      </Field>

    </div>
  )
}

function BorderSection(props: {
  element: HTMLElement,
  computedStyle: CSSStyleDeclaration,
  computedStyleMap: StylePropertyMapReadOnly,
}) {
  const borderTop = {
    width: props.computedStyleMap.get('border-top-width')?.toString(),
    color: props.computedStyleMap.get('border-top-color')?.toString(),
    isPresent: props.computedStyleMap.get('border-top-width')?.toString() !== '0px',
    str: props.computedStyleMap.get('border-top-width')?.toString() + ' ' + props.computedStyleMap.get('border-top-color')?.toString(),
  }
  const borderLeft = {
    width: props.computedStyleMap.get('border-left-width')?.toString(),
    color: props.computedStyleMap.get('border-left-color')?.toString(),
    isPresent: props.computedStyleMap.get('border-left-width')?.toString() !== '0px',
    str: props.computedStyleMap.get('border-left-width')?.toString() + ' ' + props.computedStyleMap.get('border-left-color')?.toString(),
  }
  const borderRight = {
    width: props.computedStyleMap.get('border-right-width')?.toString(),
    color: props.computedStyleMap.get('border-right-color')?.toString(),
    isPresent: props.computedStyleMap.get('border-right-width')?.toString() !== '0px',
    str: props.computedStyleMap.get('border-right-width')?.toString() + ' ' + props.computedStyleMap.get('border-right-color')?.toString(),
  }
  const borderBottom = {
    width: props.computedStyleMap.get('border-bottom-width')?.toString(),
    color: props.computedStyleMap.get('border-bottom-color')?.toString(),
    isPresent: props.computedStyleMap.get('border-bottom-width')?.toString() !== '0px',
    str: props.computedStyleMap.get('border-bottom-width')?.toString() + ' ' + props.computedStyleMap.get('border-bottom-color')?.toString(),
  }

  const displays: {
    width: string,
    color: string,
    icon: JSX.Element,
  }[] = []


  if (
    borderTop.str === borderLeft.str &&
    borderTop.str === borderRight.str &&
    borderTop.str === borderBottom.str
  ) {
    if (borderTop.isPresent) {
      displays.push({
        width: borderTop.width!,
        color: borderTop.color!,
        icon: <div className="size-[1em] border border-dotted" style={{ border: "solid rgba(255,255,255,50%)" }} />,
      })
    }
  } else {
    // Havent tested this part
    if (borderTop.str === borderBottom.str) {
      if (borderTop.isPresent) {
        displays.push({
          width: borderTop.width!,
          color: borderTop.color!,
          icon: <div className="size-[1em] border border-dotted" style={{ borderBlock: 'solid rgba(255,255,255,50%)' }} />,
        })
      }
    } else {
      if (borderTop.isPresent) {
        displays.push({
          width: borderTop.width!,
          color: borderTop.color!,
          icon: <div className="size-[1em] border border-dotted" style={{ borderTop: 'solid rgba(255,255,255,50%)' }} />,
        })
      }
      if (borderBottom.isPresent) {
        displays.push({
          width: borderBottom.width!,
          color: borderBottom.color!,
          icon: <div className="size-[1em] border border-dotted" style={{ borderBottom: 'solid rgba(255,255,255,50%)' }} />,
        })
      }
    }
    if (borderLeft.str === borderRight.str) {
      if (borderLeft.isPresent) {
        displays.push({
          width: borderLeft.width!,
          color: borderLeft.color!,
          icon: <div className="size-[1em] border border-dotted" style={{ borderInline: 'solid rgba(255,255,255,50%)' }} />,
        })
      }
    } else {
      if (borderLeft.isPresent) {
        displays.push({
          width: borderLeft.width!,
          color: borderLeft.color!,
          icon: <div className="size-[1em] border border-dotted" style={{ borderLeft: 'solid rgba(255,255,255,50%)' }} />,
        })
      }
      if (borderRight.isPresent) {
        displays.push({
          width: borderRight.width!,
          color: borderRight.color!,
          icon: <div className="size-[1em] border border-dotted" style={{ borderRight: 'solid rgba(255,255,255,50%)' }} />,
        })
      }
    }
  }

  const borderRadius = {
    topLeft: Number(props.computedStyleMap.get('border-top-left-radius')?.toString().replace('px', '')),
    topRight: Number(props.computedStyleMap.get('border-top-right-radius')?.toString().replace('px', '')),
    bottomLeft: Number(props.computedStyleMap.get('border-bottom-left-radius')?.toString().replace('px', '')),
    bottomRight: Number(props.computedStyleMap.get('border-bottom-right-radius')?.toString().replace('px', '')),
  }

  const isAllEqual = (
    borderRadius.topLeft === borderRadius.topRight &&
    borderRadius.topLeft === borderRadius.bottomLeft &&
    borderRadius.topLeft === borderRadius.bottomRight
  )

  const opacity = Number(props.computedStyle.opacity)

  const formatRadius = (num: number) => {
    return num > 9999 ? 'Full' : num + 'px'
  }


  return (
    <div className="flexcol-2/stretch text-xs">
      {displays.map((display, i) => {
        return (
          <Field key={i} className="grid grid-cols-[min-content_1fr_2rem] gap-1 gap-x-2">
            {display.icon}
            <ColorChip color={display.color} />
            <Value val={display.width} defaultIf="0" cn="text-end" />
          </Field>
        )
      })}
      <div className="grid grid-cols-2 gap-2">
        <Field className="grid grid-cols-[1rem_1fr] gap-1">
          <FluentTransparencySquare24Filled className="opacity-50" />
          <Value val={(opacity * 100) + '%'} defaultIf="100%" />
        </Field>
        <Field className="grid grid-cols-[1rem_1fr] gap-1">
          <MdiBorderRadius className="opacity-50" />
          {
            isAllEqual
              ? <Value val={formatRadius(borderRadius.topLeft)} defaultIf="0px" />
              : <span className="text-neutral-500">Mixed</span>
          }
        </Field>
      </div>
      {!isAllEqual && <>
        <div className="grid grid-cols-2 gap-2">
          <Field className="grid grid-cols-[1rem_1fr] gap-1">
            <TablerRadiusTopLeft className="opacity-50" />
            <Value val={formatRadius(borderRadius.topLeft)} defaultIf="0px" />
          </Field>
        </div>
      </>}
    </div>
  )
}

function ColorChip(props: {
  color?: string,
  withAlphaPercent?: boolean,
  className?: string
}) {
  const toFormattedHexColor = (colorstr: string) => {
    try {
      // Remove exponential notation
      const color = new Color(colorstr.replace(/-?\d+\.?\d*e[+-]?\d+/gi, num => Number(num).toFixed(6)))
      const hex = color.to('srgb').toString({ format: 'hex', collapse: false })
      const trimmed = hex.toUpperCase().replace('#', '')
      // return trimmed.length === 8 && trimmed.endsWith('00') ? 'Transparent' : trimmed.slice(0, 6)
      return {
        mainDisplay: trimmed.length === 8 && trimmed.endsWith('00') ? 'Transparent' : trimmed.slice(0, 6),
        hexAlpha: trimmed.length === 8 ? trimmed.slice(6, 8) : undefined,
        isTransparent: trimmed.length === 8 && trimmed.endsWith('00'),
        alphaPercent: color.alpha * 100,
        raw: colorstr,
      }
    } catch {
      return {
        raw: colorstr,
      }
    }
  }
  const formatted = toFormattedHexColor(props.color ?? '')

  return (
    <div className={cn("flexrow-1/center", props.className)}>
      <div className="size-3 border rounded-xs aspect-square shrink-0" style={{ backgroundColor: formatted.raw }} />
      {
        formatted.isTransparent
          ? <div className="text-neutral-500">Transparent</div>
          : <>
            <div className="grow">{formatted.mainDisplay}<span className="opacity-50">{formatted.hexAlpha}</span></div>
            {
              props.withAlphaPercent && <div className="text-end">{formatted.alphaPercent}%</div>
            }
          </>
      }
    </div>
  )
}

function TypographySection(props: {
  element: HTMLElement,
  computedStyle: CSSStyleDeclaration,
  computedStyleMap: StylePropertyMapReadOnly,
}) {
  const doesContainDirectText = Array.from(props.element.childNodes).some(c => c.nodeType === Node.TEXT_NODE && c.textContent?.trim() !== '')
  if (!doesContainDirectText) return null

  const computedStyle = props.computedStyle
  const computedStyleMap = props.computedStyleMap
  const fontFamily = computedStyleMap.get('font-family')?.toString() ?? ''
  const [mainFontFamily, ...restFontFamily] = fontFamily.split(', ')

  const exactFontSize = Number(computedStyleMap.get('font-size')?.toString().replace('px', '')!)

  const exactDocumentFontSize = Number(document.documentElement.computedStyleMap().get('font-size')?.toString()!.replace('px', '')!)
  const fontSizeInRem = Math.round((exactFontSize / exactDocumentFontSize) * 100) / 100

  const exactParentFontSize = Number(props.element.parentElement?.computedStyleMap().get('font-size')?.toString()!.replace('px', '')!)
  const fontSizeInEm = Math.round((exactFontSize / exactParentFontSize) * 100) / 100
  const isEmSameAsRem = fontSizeInEm === fontSizeInRem

  const fontWeight = computedStyleMap.get('font-weight')?.toString()
  const fontWeightSemantic = semanticFontWeight(Number(fontWeight))
  const isVariableWeight = ![100, 200, 300, 400, 500, 600, 700, 800, 900].includes(Number(fontWeight))

  const computedLetterSpacing = computedStyleMap.get('letter-spacing')?.toString()
  const isNormalLetterSpacing = computedLetterSpacing === 'normal'
  const exactLetterSpacing = computedLetterSpacing === "normal" ? 0 : Number(computedLetterSpacing?.replace('px', '')!)
  const exactLetterSpacingDisplay = isNormalLetterSpacing ? 'normal' : exactLetterSpacing + 'px'
  const letterSpacingInEm = Math.round((exactLetterSpacing / exactFontSize) * 100) / 100
  const letterSpacingInEmDisplay = isNormalLetterSpacing ? 'normal' : letterSpacingInEm + 'em'

  const isLeftAlign = computedStyle.textAlign === 'left' || (computedStyle.textAlign === 'start' && computedStyle.direction === 'ltr')
  const isRightAlign = computedStyle.textAlign === 'right' || (computedStyle.textAlign === 'end' && computedStyle.direction === 'ltr')
  const isCenterAlign = computedStyle.textAlign === 'center'
  const isJustifyAlign = computedStyle.textAlign === 'justify'

  return (
    <>
      <div className="grid grid-cols-2 gap-2">

        <div className="opacity-25 -mb-1 mt-1">
          Typography
        </div>

        {/* Row 1 */}
        <Field className="col-span-2 text-wrap leading-4 py-1.5">
          {mainFontFamily}<span className="opacity-50">, {restFontFamily.join(', ')}</span>
        </Field>

        {/* Row 2 */}
        {/* Font Weight */}
        <Field className="self-start grid grid-cols-[1rem_1fr] gap-y-1 text-wrap flex-1">
          <MdiFormatLineWeight className="opacity-75" />
          <Value val={fontWeight} defaultIf="400" />
          <Value val={fontWeightSemantic} defaultIf="Normal" cn={cn("col-start-2 opacity-50 tracking-tight font-[0.75em]", isVariableWeight && "-ml-1.5")} />
        </Field>
        {/* Font Size */}
        <Field className="grid grid-cols-[1rem_1fr] gap-y-1">
          <AntDesignFontSizeOutlined />
          <Value val={exactFontSize + 'px'} defaultIf="16px" />
          <Value val={fontSizeInRem + 'rem'} defaultIf="1rem" cn="col-start-2 opacity-50" />

          <Value val={fontSizeInEm + 'em'} defaultIf="1em" cn="col-start-2 opacity-50" hideIf={isEmSameAsRem} />

        </Field>

        {/* Row 3 */}
        {/* Line Height */}
        <Field className="grid grid-cols-[1rem_1fr] gap-y-1">
          <MdiFormatLineHeight className="opacity-75" />
          <Value val={computedStyleMap.get('line-height')?.toString()} defaultIf="normal" />
          <Value val={computedStyle.lineHeight} defaultIf="normal" cn="col-start-2 opacity-50" />
        </Field>
        {/* Letter Spacing */}
        <Field className="grid grid-cols-[1rem_1fr] gap-y-1">
          <MaterialSymbolsFormatLetterSpacing2 className="opacity-75" />
          <Value val={exactLetterSpacingDisplay} defaultIf="normal" />
          <Value val={letterSpacingInEmDisplay} defaultIf="normal" cn="col-start-2 opacity-50" />
        </Field>

        {/* Row 4 */}
        {/* Align */}
        <Field className="col-span-2 contain-content flexrow-stretch p-0.5 *:h-6 *:flexrow-center/center *:flex-1 flex-1 text-neutral-600">
          <div className={cn("data-selected:bg-blue-400/10 data-selected:text-blue-400 rounded-sm")} data-selected={isLeftAlign ? "" : undefined}>
            <MdiFormatAlignLeft className="size-4" />
          </div>
          <div className={cn("data-selected:bg-blue-400/10 data-selected:text-blue-400 rounded-sm")} data-selected={isCenterAlign ? "" : undefined}>
            <MdiFormatAlignCenter className="size-4" />
          </div>
          <div className={cn("data-selected:bg-blue-400/10 data-selected:text-blue-400 rounded-sm")} data-selected={isRightAlign ? "" : undefined}>
            <MdiFormatAlignRight className="size-4" />
          </div>
          <div className={cn("data-selected:bg-blue-400/10 data-selected:text-blue-400 rounded-sm")} data-selected={isJustifyAlign ? "" : undefined}>
            <MdiFormatAlignJustify className="size-4" />
          </div>
        </Field>

      </div>
    </>
  )
}
function semanticFontWeight(weight: number): string {
  const ranges = [
    { name: "Thin", min: 1, max: 149, exact: 100 },
    { name: "Extralight", min: 150, max: 249, exact: 200 },
    { name: "Light", min: 250, max: 349, exact: 300 },
    { name: "Normal", min: 350, max: 449, exact: 400 },
    { name: "Medium", min: 450, max: 549, exact: 500 },
    { name: "Semibold", min: 550, max: 649, exact: 600 },
    { name: "Bold", min: 650, max: 749, exact: 700 },
    { name: "Extrabold", min: 750, max: 849, exact: 800 },
    { name: "Black", min: 850, max: 1000, exact: 900 }
  ];

  for (const range of ranges) {
    if (weight >= range.min && weight <= range.max) {
      const isExact = weight === range.exact;
      return isExact ? range.name : `~${ range.name }`;
    }
  }
  return "invalid";
}

function Field(props: ComponentProps<"div">) {
  return (
    <div {...props}
      className={cn("bg-white/5 rounded-md p-2 py-1.5 leading-3 contain-inline-size overflow-clip",
        // "shadow-[inset_0_0.1rem_0.1rem_-0.1rem_#fff2,inset_0_-0.05rem_#0005,0_0.1rem_0.1rem_-0.05rem_#0002]",
        "shadow-[inset_0_0.1rem_0.1rem_-0.1rem_#fff2]",
        props.className)}
    />
  )
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

function defaultIf(match: string, value?: string) {
  if (value === match) return <span className="opacity-25">{value}</span>
  return <>{value}</>
}

function Value(props: {
  children?: ReactNode,
  val?: ReactNode,
  defaultIf?: string | boolean,
  hideIf?: boolean,
  cn?: string
}) {
  if (props.hideIf) return null
  // if ((props.val ?? props.children) === props.defaultIf) return <div className={cn("opacity-25", props.cn)}>{props.val ?? props.children}</div>
  return <div className={props.cn}>
    {
      (props.val ?? props.children) === props.defaultIf
        ? <span className="opacity-25">{props.val ?? props.children}</span>
        : <>{props.val ?? props.children}</>
    }
  </div>
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
export function MdiFormatLineWeight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE */}<path fill="currentColor" d="M3 17h18v-2H3zm0 3h18v-1H3zm0-7h18v-3H3zm0-9v4h18V4z"></path></svg>
  )
}

export function AntDesignFontSizeOutlined(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1024 1024" {...props}>{/* Icon from Ant Design Icons by HeskeyBaozi - https://github.com/ant-design/ant-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M920 416H616c-4.4 0-8 3.6-8 8v112c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-56h60v320h-46c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h164c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8h-46V480h60v56c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V424c0-4.4-3.6-8-8-8M656 296V168c0-4.4-3.6-8-8-8H104c-4.4 0-8 3.6-8 8v128c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-64h168v560h-92c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h264c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-92V232h168v64c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8"></path></svg>
  )
}

export function ProiconsTextLineHeight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from ProIcons by ProCode - https://github.com/ProCode-Software/proicons/blob/main/LICENSE */}<g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"><path strokeLinejoin="round" d="m2.75 18.345l1.992 2.037c.235.24.547.361.858.361m2.85-2.398l-1.992 2.037c-.235.24-.547.361-.858.361M2.75 5.61l2.002-2.002c.234-.234.54-.351.848-.351M8.45 5.61l-2-2.002a1.2 1.2 0 0 0-.849-.351m0 17.486V3.257"></path><path d="M11.55 4.25h9.7m-9.7 15.5h9.7"></path><path strokeLinejoin="round" d="m13.12 15.594l1.171-2.752m0 0h4.219m-4.219 0l1.796-4.218a.335.335 0 0 1 .627 0l1.796 4.217m0 0l1.172 2.753"></path></g></svg>
  )
}

export function MaterialSymbolsFormatLetterSpacing2(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="m6 22l-4-4l4-4l1.425 1.4l-1.6 1.6h12.35L16.6 15.4L18 14l4 4l-4 4l-1.425-1.4l1.6-1.6H5.825L7.4 20.6zm.9-9L11 2h2l4.1 11h-1.9l-.95-2.8H9.8l-1 2.8zm3.45-4.4h3.3l-1.6-4.55h-.1z"></path></svg>
  )
}

export function MdiFormatLineHeight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE */}<path fill="currentColor" d="M21 22H3v-2h18zm0-18H3V2h18zm-11 9.7h4l-2-5.4zM11.2 6h1.7l4.7 12h-2l-.9-2.6H9.4L8.5 18h-2z"></path></svg>
  )
}

export function MdiFormatAlignLeft(props: SVGProps<SVGSVGElement>) {

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Lucide by Lucide Contributors - https://github.com/lucide-icons/lucide/blob/main/LICENSE */}<path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 12H3m14 6H3M21 6H3"></path></svg>
  )
}
export function MdiFormatAlignCenter(props: SVGProps<SVGSVGElement>) {

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Lucide by Lucide Contributors - https://github.com/lucide-icons/lucide/blob/main/LICENSE */}<path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 12H7m12 6H5M21 6H3"></path></svg>
  )
}
export function MdiFormatAlignRight(props: SVGProps<SVGSVGElement>) {

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Lucide by Lucide Contributors - https://github.com/lucide-icons/lucide/blob/main/LICENSE */}<path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 12H9m12 6H7M21 6H3"></path></svg>
  )
}
export function MdiFormatAlignJustify(props: SVGProps<SVGSVGElement>) {

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Lucide by Lucide Contributors - https://github.com/lucide-icons/lucide/blob/main/LICENSE */}<path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 12h18M3 18h18M3 6h18"></path></svg>
  )
}
export function BiFonts(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16" {...props}>{/* Icon from Bootstrap Icons by The Bootstrap Authors - https://github.com/twbs/icons/blob/main/LICENSE.md */}<path fill="currentColor" d="M12.258 3h-8.51l-.083 2.46h.479c.26-1.544.758-1.783 2.693-1.845l.424-.013v7.827c0 .663-.144.82-1.3.923v.52h4.082v-.52c-1.162-.103-1.306-.26-1.306-.923V3.602l.431.013c1.934.062 2.434.301 2.693 1.846h.479z"></path></svg>
  )
}
export function HugeiconsBackground(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Huge Icons by Hugeicons - undefined */}<path fill="currentColor" d="M12.747 22.315h.002q.764 0 1.442-.002a1 1 0 0 0 .121 0c3.393-.02 5.26-.172 6.676-1.378c.24-.2.44-.41.64-.64c1.38-1.62 1.38-3.83 1.38-8.24s0-6.62-1.38-8.24c-.2-.24-.41-.44-.64-.64c-1.62-1.38-3.83-1.38-8.24-1.38s-6.62 0-8.24 1.38c-.24.2-.44.41-.64.64c-1.38 1.62-1.38 3.83-1.38 8.24s0 6.62 1.38 8.24c.2.24.41.44.64.64c1.62 1.38 3.84 1.38 8.24 1.38m.001-1.52c-.796 0-1.513 0-2.162-.008L21.48 9.884q.01.975.008 2.17v1.211l-7.53 7.529zm7.26-1.02c-.805.685-1.986.91-3.894.984l5.338-5.339c-.074 1.909-.299 3.09-.984 3.895c-.14.17-.29.32-.46.46M11.556 3.316l1.192-.001q1.198-.002 2.173.008L4.016 14.236c-.008-.653-.008-1.378-.008-2.181l.001-1.192zm-2.154.034L4.044 8.71c.073-1.92.297-3.106.984-3.914c.14-.17.29-.32.46-.46c.81-.688 1.991-.912 3.914-.985m10.265.736L4.779 18.973c-.402-.645-.594-1.5-.686-2.692L16.965 3.399c1.197.091 2.055.284 2.702.687M5.84 20.03L20.725 5.148c.398.645.588 1.5.68 2.69L8.542 20.713c-1.195-.09-2.054-.282-2.7-.68" color="currentColor"></path></svg>
  )
}



export function UimBorderTop(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Unicons Monochrome by Iconscout - https://github.com/Iconscout/unicons/blob/master/LICENSE */}<path fill="currentColor" d="M20 4.5H4a1 1 0 0 1 0-2h16a1 1 0 0 1 0 2"></path><circle cx="12" cy="7.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="12" cy="11.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="12" cy="15.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="12" cy="19.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="20" cy="7.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="20" cy="11.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="20" cy="15.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="20" cy="19.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="16" cy="19.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="8" cy="19.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="16" cy="11.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="8" cy="11.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="4" cy="7.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="4" cy="11.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="4" cy="15.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="4" cy="19.5" r="1" fill="currentColor" opacity=".5"></circle></svg>
  )
}
export function UimBorderRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Unicons Monochrome by Iconscout - https://github.com/Iconscout/unicons/blob/master/LICENSE */}<path fill="currentColor" d="M20.5 21a1 1 0 0 1-1-1V4a1 1 0 0 1 2 0v16a1 1 0 0 1-1 1"></path><circle cx="16.5" cy="12" r="1" fill="currentColor" opacity=".5"></circle><circle cx="12.5" cy="12" r="1" fill="currentColor" opacity=".5"></circle><circle cx="8.5" cy="12" r="1" fill="currentColor" opacity=".5"></circle><circle cx="4.5" cy="12" r="1" fill="currentColor" opacity=".5"></circle><circle cx="16.5" cy="20" r="1" fill="currentColor" opacity=".5"></circle><circle cx="12.5" cy="20" r="1" fill="currentColor" opacity=".5"></circle><circle cx="8.5" cy="20" r="1" fill="currentColor" opacity=".5"></circle><circle cx="4.5" cy="20" r="1" fill="currentColor" opacity=".5"></circle><circle cx="4.5" cy="16" r="1" fill="currentColor" opacity=".5"></circle><circle cx="4.5" cy="8" r="1" fill="currentColor" opacity=".5"></circle><circle cx="12.5" cy="16" r="1" fill="currentColor" opacity=".5"></circle><circle cx="12.5" cy="8" r="1" fill="currentColor" opacity=".5"></circle><circle cx="16.5" cy="4" r="1" fill="currentColor" opacity=".5"></circle><circle cx="12.5" cy="4" r="1" fill="currentColor" opacity=".5"></circle><circle cx="8.5" cy="4" r="1" fill="currentColor" opacity=".5"></circle><circle cx="4.5" cy="4" r="1" fill="currentColor" opacity=".5"></circle></svg>
  )
}
export function UimBorderBottom(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Unicons Monochrome by Iconscout - https://github.com/Iconscout/unicons/blob/master/LICENSE */}<path fill="currentColor" d="M20 21.5H4a1 1 0 0 1 0-2h16a1 1 0 0 1 0 2"></path><circle cx="12" cy="16.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="12" cy="12.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="12" cy="8.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="12" cy="4.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="4" cy="16.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="4" cy="12.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="4" cy="8.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="4" cy="4.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="8" cy="4.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="16" cy="4.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="8" cy="12.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="16" cy="12.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="20" cy="16.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="20" cy="12.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="20" cy="8.5" r="1" fill="currentColor" opacity=".5"></circle><circle cx="20" cy="4.5" r="1" fill="currentColor" opacity=".5"></circle></svg>
  )
}
export function UimBorderLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Unicons Monochrome by Iconscout - https://github.com/Iconscout/unicons/blob/master/LICENSE */}<path fill="currentColor" d="M3.5 21a1 1 0 0 1-1-1V4a1 1 0 0 1 2 0v16a1 1 0 0 1-1 1"></path><circle cx="7.5" cy="12" r="1" fill="currentColor" opacity=".5"></circle><circle cx="11.5" cy="12" r="1" fill="currentColor" opacity=".5"></circle><circle cx="15.5" cy="12" r="1" fill="currentColor" opacity=".5"></circle><circle cx="19.5" cy="12" r="1" fill="currentColor" opacity=".5"></circle><circle cx="7.5" cy="4" r="1" fill="currentColor" opacity=".5"></circle><circle cx="11.5" cy="4" r="1" fill="currentColor" opacity=".5"></circle><circle cx="15.5" cy="4" r="1" fill="currentColor" opacity=".5"></circle><circle cx="19.5" cy="4" r="1" fill="currentColor" opacity=".5"></circle><circle cx="19.5" cy="8" r="1" fill="currentColor" opacity=".5"></circle><circle cx="19.5" cy="16" r="1" fill="currentColor" opacity=".5"></circle><circle cx="11.5" cy="8" r="1" fill="currentColor" opacity=".5"></circle><circle cx="11.5" cy="16" r="1" fill="currentColor" opacity=".5"></circle><circle cx="7.5" cy="20" r="1" fill="currentColor" opacity=".5"></circle><circle cx="11.5" cy="20" r="1" fill="currentColor" opacity=".5"></circle><circle cx="15.5" cy="20" r="1" fill="currentColor" opacity=".5"></circle><circle cx="19.5" cy="20" r="1" fill="currentColor" opacity=".5"></circle></svg>
  )
}


export function TablerRadiusTopLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Tabler Icons by Paweł Kuna - https://github.com/tabler/tabler-icons/blob/master/LICENSE */}<path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19v-6a8 8 0 0 1 8-8h6"></path></svg>
  )
}

export function FluentTransparencySquare24Filled(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Fluent UI System Icons by Microsoft Corporation - https://github.com/microsoft/fluentui-system-icons/blob/main/LICENSE */}<path fill="currentColor" d="M6.25 2.5A3.75 3.75 0 0 0 2.5 6.25v11.5a3.75 3.75 0 0 0 3.75 3.75h11.5a3.75 3.75 0 0 0 3.75-3.75V6.25a3.75 3.75 0 0 0-3.75-3.75zM4.5 6.25c0-.966.784-1.75 1.75-1.75H8V8H4.5zm0 5.75H8V8h4V4.5h4V8h3.5v4H16v4h3.5v1.75a1.75 1.75 0 0 1-1.75 1.75H16V16h-4v3.5H8V16H4.5zm7.5 0v4H8v-4zm0 0h4V8h-4z"></path></svg>
  )
}
export function MdiBorderRadius(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE */}<path fill="currentColor" d="M3 16c0 2.8 2.2 5 5 5h2v-2H8c-1.7 0-3-1.3-3-3v-2H3zm18-8c0-2.8-2.2-5-5-5h-2v2h2c1.7 0 3 1.3 3 3v2h2zm-5 13c2.8 0 5-2.2 5-5v-2h-2v2c0 1.7-1.3 3-3 3h-2v2zM8 3C5.2 3 3 5.2 3 8v2h2V8c0-1.7 1.3-3 3-3h2V3z"></path></svg>
  )
}