"use client"

import { createContext, useEffect, useState, type ReactNode } from "react"



const initialThemePreviewValues = {
  colorBackground: "#ffffff",
  colorForeground: "oklch(37.1% 0 0)",
  colorPrimary: "oklch(37.1% 0 0)",
  colorDestructive: "oklch(57.7% 0.245 27.325)",
}

const initialContextValues = {
  ...initialThemePreviewValues,
  setData: (_: Partial<typeof initialThemePreviewValues>) => { },
  reset: () => { },
}

export const ThemePreviewContext = createContext(initialContextValues)


export function ThemePreviewProvider(props: {
  children: ReactNode,
}) {

  const [data, setData] = useState(initialContextValues)

  useEffect(() => {
    const root = document.documentElement

    root.style.setProperty("--color-background", data.colorBackground)
    root.style.setProperty("--color-foreground", data.colorForeground)
    root.style.setProperty("--color-primary", data.colorPrimary)
    root.style.setProperty("--color-destructive", data.colorDestructive)
  })

  return (
    <ThemePreviewContext.Provider value={{
      ...data,
      setData: (newData) => {
        setData((prevState) => ({
          ...prevState,
          ...newData,
        }))
      },
      reset: () => {
        setData(initialContextValues)
      }
    }}>
      {props.children}
    </ThemePreviewContext.Provider>
  )
}

