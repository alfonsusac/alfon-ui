"use client"

import { createContext, use, useEffect, useRef, useState, type ComponentProps, type SVGProps } from "react"
import { ThemePreviewContext } from "../../preview-theme"
import { Button } from "@/lib/components/button"
import { cn } from "lazy-cn"
import Color from "colorjs.io"
import { getEyedropperAPI } from "@/lib/eyedropper"

export function ThemeSettingsClient() {

  const [opened, setOpened] = useState(true)
  const previewTheme = use(ThemePreviewContext)
  const [currentDragging, setCurrentDragging] = useState<DraggingContextData | null>(null)

  const [lockMap, setLockMap] = useState(new Map<string, {
    hue: boolean,
    saturation: boolean,
    lightness: boolean,
  }>(Object.entries({
    ['theme-preview-color-foreground']: {
      hue: true,
      saturation: true,
      lightness: false,
    },
    ['theme-preview-color-background']: {
      hue: true,
      saturation: true,
      lightness: true,
    },
    ['theme-preview-color-primary']: {
      hue: true,
      saturation: false,
      lightness: false,
    },
    ['theme-preview-color-destructive']: {
      hue: false,
      saturation: false,
      lightness: false,
    },
  })))

  return (
    <>
      <button
        onClick={() => setOpened(!opened)}
        className="block w-full text-start text-xs p-2 text-current/50 hover:bg-current/5 hover:text-current  cursor-pointer">
        <span className={cn("inline-block transition", opened ? "rotate-90" : "")}>{'->'}</span> Theme Settings
      </button>
      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] data-opened:grid-rows-[1fr] overflow-clip" data-opened={opened ? "" : undefined}>
        <div className="min-h-0">
          <div className="flex flex-col gap-2 [&_label]:text-xs p-3">
            <div className="grid grid-cols-4 gap-4">
              <HueGroupDragContext.Provider value={{
                currentDragging,
                setCurrentDragging,
                setLockMap: (id, type, value) => {
                  const lockMapData = lockMap.get(id)
                  if (!lockMapData) {
                    setLockMap(new Map(lockMap).set(id, {
                      hue: type === "hue" ? value : false,
                      saturation: type === "saturation" ? value : false,
                      lightness: type === "lightness" ? value : false,
                    }))
                  } else {
                    setLockMap(new Map(lockMap).set(id, {
                      ...lockMapData,
                      [type]: value,
                    }))
                  }
                },
                lockMap,
              }}>
                <div className="flex flex-col gap-1">
                  <label
                    className="w-20"
                    htmlFor="theme-preview-color-foreground"
                  >Foreground</label>
                  <ColorPicker
                    id="theme-preview-color-foreground"
                    color={previewTheme.colorForeground}
                    onChange={color => previewTheme.setData({ colorForeground: color })}
                    otherColors={[previewTheme.colorBackground, previewTheme.colorPrimary]}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    className="w-20"
                    htmlFor="theme-preview-color-background"
                  >Background</label>
                  <ColorPicker
                    id="theme-preview-color-background"
                    color={previewTheme.colorBackground}
                    onChange={color => previewTheme.setData({ colorBackground: color })}
                    otherColors={[previewTheme.colorForeground, previewTheme.colorPrimary]}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    className="w-20"
                    htmlFor="theme-preview-color-primary"
                  >Primary</label>
                  <ColorPicker
                    id="theme-preview-color-primary"
                    color={previewTheme.colorPrimary}
                    onChange={color => previewTheme.setData({ colorPrimary: color })}
                    otherColors={[previewTheme.colorForeground, previewTheme.colorBackground]}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    className="w-20"
                    htmlFor="theme-preview-color-primary"
                  >Destructive</label>
                  <ColorPicker
                    id="theme-preview-color-destructive"
                    color={previewTheme.colorDestructive}
                    onChange={color => previewTheme.setData({ colorDestructive: color })}
                    otherColors={[previewTheme.colorForeground, previewTheme.colorBackground]}
                  />
                </div>
              </HueGroupDragContext.Provider>

            </div>
            <Button className="hover:bg-current/5" onClick={() => previewTheme.reset()}>Reset</Button>
          </div>
        </div>
      </div>

    </>
  )
}

function ColorPicker(props: {
  id: string
  color?: string,
  onChange?: (color: string) => void,
  otherColors?: string[],
}) {
  const [color, setColor] = useState(new Color(props.color ?? "#FF0000").to('hsl'))

  useEffect(() => {
    setColor(new Color(props.color ?? "#FF0000").to('hsl'))
  }, [props.color])

  const hsl = color.hsl
  const hue = hsl.h ||= 0
  const sat = hsl.s ||= 0
  const lig = hsl.l ||= 0

  const eyedropper = getEyedropperAPI()

  return (
    <div className="flex flex-col gap-1 ">
      <div className="">
        <ColorPicker2DRange
          $groupId={props.id}
          $hue={hue}
          $value={{
            saturation: sat / 100,
            lightness: lig / 100,
          }}
          $onChange={(sat, val) => {
            color.hsl.s = sat * 100
            color.hsl.l = val * 100
            const newColor = new Color(color)
            setColor(newColor)
            props.onChange?.(newColor.toString())
          }}
          $otherPoints={props.otherColors?.map(e => {
            const c = new Color(e).to('hsl')
            return {
              saturation: c.hsl.s / 100,
              lightness: c.hsl.l / 100,
            }
          })}
        />
      </div>

      <div className="flex gap-1 items-center">
        <Button xs icon className="hover:bg-current/5" onClick={async () => {
          if (!eyedropper.support) return
          const res = await eyedropper.getColor()
          if (!res) return
          setColor(new Color(res).to('hsl'))
          props.onChange?.(res)
        }}>
          <MdiEyedropper />
        </Button>
        <ColorPickerHueRange
          $groupId={props.id}
          className="flex-1"
          $value={hue}
          $onChange={(hue) => {
            color.hsl.h = hue
            const newColor = new Color(color)
            setColor(newColor)
            props.onChange?.(newColor.toString())
          }}
        />
      </div>

      <div className="flex gap-1 *:flex-1">
        <LockButton
          groupid={props.id}
          text={"H"}
          hsl={"hue"}
        />
        <LockButton
          groupid={props.id}
          text={"S"}
          hsl={"saturation"}
        />
        <LockButton
          groupid={props.id}
          text={"L"}
          hsl={"lightness"}
        />
      </div>
      {/* {color.toString()} {String(hue)} {String(sat)} {String(lig)}  {String(hex)} */}
    </div>
  )
}

function LockButton(props: {
  groupid: string,
  text: "H" | "S" | "L",
  hsl: "hue" | "saturation" | "lightness",
}) {
  const groupDrag = use(HueGroupDragContext)

  const isLocked = groupDrag.lockMap.get(props.groupid)?.[props.hsl] ?? false

  return (
    <Button xs icon className={cn(
      "hover:bg-current/5 gap-0",
      isLocked ? "text-current" : "text-current/25",
    )}
      onClick={() => {
        groupDrag.setLockMap(props.groupid, props.hsl, !isLocked)
      }}
    >
      {props.text}
      <MdiLock className="size-3!" />
    </Button>
  )
}

function Pointer(props: ComponentProps<"div">) {
  return (
    <div {...props} className={cn("size-4 border border-4 border-white rounded-full shadow-md absolute", props.className)} />
  )
}

function ColorPicker2DRange({ $groupId, $value, $hue, $onChange, $otherPoints, className, ...props }: ComponentProps<"div"> & {
  $groupId?: string,
  $value?: {
    saturation: number,
    lightness: number,
  }
  $hue: number,
  $onChange?: (saturation: number, lightness: number) => void,
  $otherPoints?: {
    saturation: number,
    lightness: number,
  }[]
}) {
  const [value, setValue] = useState({
    saturation: clamp($value?.saturation ?? 0, [0, 1]), // X [0, 1]
    lightness: clamp($value?.lightness ?? 1, [0, 1]),   // Y [0, 1]
  })
  const isActive = useRef(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    setValue({
      saturation: clamp($value?.saturation ?? 0, [0, 1]), // X [0, 1]
      lightness: clamp($value?.lightness ?? 1, [0, 1]),   // Y [0, 1]
    })
  }, [$value])

  const groupDrag = use(HueGroupDragContext)
  const isSatLocked = ($groupId && groupDrag.lockMap.get($groupId)?.saturation) ?? false
  const isLigLocked = ($groupId && groupDrag.lockMap.get($groupId)?.lightness) ?? false
  const isGroupDragging = groupDrag.currentDragging?.type === "2drange" && groupDrag.currentDragging.id !== $groupId

  useEffect(() => {
    const currentDragging = groupDrag.currentDragging
    if (!currentDragging) return
    const synced: ("saturation" | "lightness")[] = []
    if (groupDrag.lockMap.get(currentDragging.id)?.lightness && isLigLocked) {
      synced.push("lightness")
    }
    if (groupDrag.lockMap.get(currentDragging.id)?.saturation && isSatLocked) {
      synced.push("saturation")
    }
    if (synced.length > 0) {
      onInitiateDrag(currentDragging.mouseEvent, synced)
    }
  }, [isGroupDragging])


  const onInitiateDrag = (e: React.MouseEvent, isGroupDrag?: ("saturation" | "lightness")[]) => {
    isActive.current = true
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const startPos = { x: e.clientX, y: e.clientY }

    if ((isSatLocked || isLigLocked) && $groupId && !isGroupDrag) {
      groupDrag.setCurrentDragging({
        id: $groupId,
        type: "2drange",
        mouseEvent: e,
      })
    }

    const cancelEvent = () => {
      isActive.current = false
      groupDrag.setCurrentDragging(null)
      window.removeEventListener("mousemove", mouseMove)
    }

    const mouseMove = (e: MouseEvent) => {
      if (e.buttons === 0) {
        return cancelEvent()
      }
      if (isActive.current) {
        const dx = (isGroupDrag?.includes('saturation') || !isGroupDrag) ? (e.clientX - startPos.x) : 0
        const dy = (isGroupDrag?.includes('lightness') || !isGroupDrag) ? (e.clientY - startPos.y) : 0
        const newSat = clamp(value.saturation + (dx / rect.width), [0, 1])
        const newLight = clamp(value.lightness + (-dy / rect.height), [0, 1])
        $onChange?.(newSat, newLight)
        setValue({ saturation: newSat, lightness: newLight })
      }
    }
    window.addEventListener("mouseup", () => cancelEvent(), { once: true })
    window.addEventListener("mousemove", mouseMove)
  }

  return (
    <div {...props}
      ref={ref}
      className={cn("aspect-square rounded-md relative select-none cursor-grab active:cursor-grabbing",
        "border border-neutral-600/75",
        className)}
      style={{
        background: `border-box linear-gradient(to bottom, hsl(0 0% 100% / 1), hsl(0 0% 50%/0), hsl(0 0% 0%/1)), linear-gradient(to right, hsl(${ $hue }, 0%, 50%), hsl(${ $hue }, 100%, 50%))`,
      }}
      onMouseDown={e => {
        onInitiateDrag(e)
      }}
    >
      <Pointer style={{
        left: `calc(${ value.saturation * 100 }% - 8px)`,
        top: `calc(${ 100 - value.lightness * 100 }% - 8px)`,
        background: `hsl(${ $hue }, ${ (value.saturation * 100) }%, ${ (value.lightness * 100) }%)`,
      }} />
      {
        $otherPoints?.map((point, i) => {
          return (
            <Pointer key={i}
              className="pointer-events-none opacity-25 size-2"
              style={{
                left: `calc(${ point.saturation * 100 }% - 4px)`,
                top: `calc(${ 100 - point.lightness * 100 }% - 4px)`,
                background: `hsl(${ $hue }, ${ (point.saturation * 100) }%, ${ (point.lightness * 100) }%)`,
              }} />
          )
        })
      }
      <div className="text-green-500">
        {/* {isGroupDragging ? "true" : "false"} <br /> */}
        {/* {value.saturation} <br />
        {value.lightness} <br />
        {$value?.saturation} <br />
        {$value?.lightness} */}
      </div>
    </div>
  )
}

function ColorPickerHueRange({ $value, $onChange, $groupId, className, ...props }: ComponentProps<"div"> & {
  $groupId?: string,
  $value?: number,
  $onChange?: (hue: number) => void
}) {
  const [hue, setHue] = useState($value ?? 0) // [0, 359]
  const groupDrag = use(HueGroupDragContext)
  const isLocked = ($groupId && groupDrag.lockMap.get($groupId)?.hue) ?? false
  const isGroupDragging = groupDrag.currentDragging?.type === "hue" && groupDrag.currentDragging.id !== $groupId
  const isActive = useRef(false)
  useEffect(() => {
    setHue($value ?? 0)
  }, [$value])

  useEffect(() => {
    if (isGroupDragging && isLocked && groupDrag.currentDragging) {
      onInitiateDrag(groupDrag.currentDragging?.mouseEvent, true)
    }
  }, [isGroupDragging])

  const ref = useRef<HTMLDivElement>(null)

  const onInitiateDrag = (e: React.MouseEvent, isGroupDrag?: boolean) => {
    isActive.current = true
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const startPos = e.clientX

    if (isLocked && $groupId && !isGroupDrag) {
      groupDrag.setCurrentDragging({
        id: $groupId,
        type: "hue",
        mouseEvent: e,
      })
    }

    const cancelEvent = () => {
      isActive.current = false
      groupDrag.setCurrentDragging(null)
      window.removeEventListener("mousemove", mouseMove)
    }

    const mouseMove = (e: MouseEvent) => {
      if (e.buttons === 0)
        return cancelEvent()

      if (isActive.current && e.buttons === 1) {
        const dx = e.clientX - startPos
        // dont clamp but loop around
        const newHue = ((hue + (dx / rect.width) * 359) % 360 + 360) % 360;
        setHue(newHue)
        $onChange?.(newHue) // test this
      }
    }
    window.addEventListener("mouseup", () => cancelEvent(), { once: true })
    window.addEventListener("mousemove", mouseMove)
  }




  return (
    <div {...props}
      ref={ref}
      className={cn("h-4 bg-red-500 relative cursor-grab active:cursor-grabbing select-none mx-2 ",
        "before:h-4 before:w-[calc(100%+1rem)] before:-left-2 before:-z-10 before:bg-[hsl(360,75%,50%)] before:block before:absolute before:rounded-full",
        "before:border before:border-neutral-600/75 before:bg-origin-border before:-mt-px",
        "border-y border-neutral-600/75",
        className)}
      style={{
        background: "border-box linear-gradient(90deg in hsl longer hue, hsl(0,75%,50%), hsl(359,75%,50%))",
      }}
      onMouseDown={e => {
        onInitiateDrag(e)
      }}
    >
      <Pointer className="border-4 -mt-px" style={{
        left: `calc(${ hue * 100 / 359 }% - 8px)`,
        background: `hsl(${ hue }, 100%, 50%)`,
      }} />
      {/* {isLocked ? "true" : "false"}   {!!isGroupDragging ? "true" : "false"} */}
    </div>
  )
}

type DraggingContextData = {
  id: string,
  type: "hue" | "2drange",
  mouseEvent: React.MouseEvent,
}

const HueGroupDragContext = createContext({
  currentDragging: null as null | DraggingContextData,
  setCurrentDragging: (data: null | DraggingContextData) => { },
  lockMap: new Map<string, {
    hue: boolean,
    saturation: boolean,
    lightness: boolean,
  }>(),
  setLockMap: (id: string, type: "hue" | "saturation" | "lightness", value: boolean) => { },

})


function clamp(val: number, range: [number, number]) {
  return Math.min(Math.max(val, range[0]), range[1])
}


export function MdiEyedropper(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE */}<path fill="currentColor" d="m19.35 11.72l-2.13 2.13l-1.41-1.42l-7.71 7.71L3.5 22L2 20.5l1.86-4.6l7.71-7.71l-1.42-1.41l2.13-2.13zM16.76 3A3 3 0 0 1 21 3a3 3 0 0 1 0 4.24l-1.92 1.92l-4.24-4.24zM5.56 17.03L4.5 19.5l2.47-1.06L14.4 11L13 9.6z"></path></svg>
  )
}



export function MdiLock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE */}<path fill="currentColor" d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3"></path></svg>
  )
}


export function MdiLockOpenVariant(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE */}<path fill="currentColor" d="M18 1c-2.76 0-5 2.24-5 5v2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12c1.11 0 2-.89 2-2V10a2 2 0 0 0-2-2h-1V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2h2V6c0-2.76-2.24-5-5-5m-8 12a2 2 0 0 1 2 2c0 1.11-.89 2-2 2a2 2 0 1 1 0-4"></path></svg>
  )
}