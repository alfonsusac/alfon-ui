"use client"

import { createContext, useState, type ReactNode } from "react"



const initialThemePreviewValues = {
  colorBackground: "#ffffff",
  colorForeground: "oklch(37.1% 0 0)",
  colorPrimary: "oklch(37.1% 0 0)",
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

