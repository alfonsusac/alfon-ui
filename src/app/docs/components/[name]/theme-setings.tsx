"use client"

import { use, useEffect, useRef, useState, type ComponentProps } from "react"
import { ThemePreviewContext } from "../../preview-theme"
import { Button } from "@/lib/components/button"
import { cn } from "lazy-cn"
import Color from "colorjs.io"

export function ThemeSettingsClient() {

  const [opened, setOpened] = useState(true)
  const previewTheme = use(ThemePreviewContext)

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

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label
                  className="w-20"
                  htmlFor="theme-preview-color-foreground"
                >Foreground</label>
                <ColorPicker
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
                  color={previewTheme.colorPrimary}
                  onChange={color => previewTheme.setData({ colorPrimary: color })}
                  otherColors={[previewTheme.colorForeground, previewTheme.colorBackground]}
                />
              </div>
            </div>


            <Button className="hover:bg-current/5" onClick={() => previewTheme.reset()}>Reset</Button>
          </div>
        </div>
      </div>

    </>
  )
}

function ColorPicker(props: {
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
  const hex = parseProperHex(color.to('srgb').toString({ format: 'hex' }))

  return (
    <div className="flex flex-col gap-2 ">
      <div className="">
        <ColorPicker2DRange
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

      <ColorPickerHueRange
        $value={hue}
        $onChange={(hue) => {
          color.hsl.h = hue
          const newColor = new Color(color)
          setColor(newColor)
          props.onChange?.(newColor.toString())
        }}
      />
      {/* {color.toString()} {String(hue)} {String(sat)} {String(lig)}  {String(hex)} */}
    </div>
  )
}

function Pointer(props: ComponentProps<"div">) {
  return (
    <div {...props} className={cn("size-4 border border-4 border-white rounded-full shadow-md absolute", props.className)} />
  )
}

function ColorPicker2DRange({ $value, $hue, $onChange, $otherPoints, className, ...props }: ComponentProps<"div"> & {
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
    saturation: $value?.saturation ?? 0, // X [0, 1]
    lightness: $value?.lightness ?? 1,   // Y [0, 1]
  })
  const isActive = useRef(false)
  useEffect(() => {
    setValue({
      saturation: $value?.saturation ?? 0,
      lightness: $value?.lightness ?? 1,
    })
  }, [$value])
  return (
    <div {...props}
      className={cn("aspect-square rounded-md relative select-none cursor-grab active:cursor-grabbing",
        "border border-neutral-600/75",
        className)}
      style={{
        background: `border-box linear-gradient(to bottom, hsl(0 0% 100% / 1), hsl(0 0% 50%/0), hsl(0 0% 0%/1)), linear-gradient(to right, hsl(${ $hue }, 0%, 50%), hsl(${ $hue }, 100%, 50%))`,
      }}
      onMouseDown={e => {
        isActive.current = true
        const rect = e.currentTarget.getBoundingClientRect()
        const startPos = { x: e.clientX, y: e.clientY }
        const mouseMove = (e: MouseEvent) => {
          if (e.buttons === 0) {
            isActive.current = false
            window.removeEventListener("mousemove", mouseMove)
            return
          }
          if (isActive.current) {
            const dx = e.clientX - startPos.x
            const dy = e.clientY - startPos.y
            const newSat = Math.min(Math.max(value.saturation + (dx / rect.width), 0), 1)
            const newLight = Math.min(Math.max(value.lightness + (-dy / rect.height), 0), 1)
            $onChange?.(newSat, newLight)
            setValue({ saturation: newSat, lightness: newLight })
          }
        }
        window.addEventListener("mousemove", mouseMove)
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
              className="pointer-events-none opacity-25"
              style={{
              left: `calc(${ point.saturation * 100 }% - 8px)`,
              top: `calc(${ 100 - point.lightness * 100 }% - 8px)`,
              background: `hsl(${ $hue }, ${ (point.saturation * 100) }%, ${ (point.lightness * 100) }%)`,
            }} />
          )
        })
      }
      {/* <div className="text-green-500">
        {value.saturation} <br />
        {value.lightness} <br />
        {$value?.saturation} <br />
        {$value?.lightness}
      </div> */}
    </div>
  )
}

function ColorPickerHueRange({ $value, $onChange, className, ...props }: ComponentProps<"div"> & {
  $value?: number,
  $onChange?: (hue: number) => void
}) {
  const [hue, setHue] = useState($value ?? 0) // [0, 359]
  const isActive = useRef(false)
  useEffect(() => {
    setHue($value ?? 0)
  }, [$value])

  return (
    <div {...props}
      className={cn("h-4 bg-red-500 relative cursor-grab active:cursor-grabbing select-none mx-2 ",
        "before:h-4 before:w-[calc(100%+1rem)] before:-left-2 before:-z-10 before:bg-[hsl(360,75%,50%)] before:block before:absolute before:rounded-full",
        " before:border before:border-neutral-600/75 before:bg-origin-border",

        className)}

      style={{
        background: "linear-gradient(90deg in hsl longer hue, hsl(0,75%,50%), hsl(359,75%,50%))",
      }}
      onMouseDown={e => {
        isActive.current = true
        const rect = e.currentTarget.getBoundingClientRect()
        const startPos = e.clientX
        const mouseMove = (e: MouseEvent) => {
          if (e.buttons === 0) {
            isActive.current = false
            window.removeEventListener("mousemove", mouseMove)
            return
          }
          if (isActive.current && e.buttons === 1) {
            const dx = e.clientX - startPos
            const newHue = Math.min(Math.max(hue + (dx / rect.width) * 359, 0), 359)
            setHue(newHue)
            $onChange?.(newHue) // test this
          }
        }
        window.addEventListener("mousemove", mouseMove)
      }}
    >
      <Pointer className="border-4" style={{
        left: `calc(${ hue * 100 / 359 }% - 8px)`,
        background: `hsl(${ hue }, 100%, 50%)`,
      }} />
    </div>
  )
}



function parseProperHex(str: string) {
  if (!str.startsWith('#') || str.length !== 4) return str
  const r = str[1]
  const g = str[2]
  const b = str[3]
  return `#${ r }${ r }${ g }${ g }${ b }${ b }`
}

// function getHSLColor(str: string = '') {
//   const res = new Color(str)
//   if (res.to('hsl').toString().includes('none')) {
//     console.log("Invalid color", str)
//     return new Color("#fff")
//   } else {
//     return res.to('hsl')
//   }
// }