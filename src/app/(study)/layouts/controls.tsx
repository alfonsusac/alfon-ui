"use client"

import { cn } from "lazy-cn";
import { useEffect, useRef, useState } from "react";

export function useHelperControls() {

  const rootRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null)

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [ctrlPressed, setCtrlPressed] = useState(false)
  const [shiftPressed, setShiftPressed] = useState(false)
  useEffect(() => {
    const keyPressed = (e: KeyboardEvent) => {
      if (e.key === "c") setCtrlPressed(prev => !prev)
      if (e.key === "s") setShiftPressed(prev => !prev)
    }
    document.addEventListener("keypress", keyPressed)
    return () => document.removeEventListener("keypress", keyPressed)
  }, [])

  useEffect(() => {
    if (!rootRef.current) return
    const root = rootRef.current;
    if (shiftPressed === false) {
      root.style.setProperty('--control-p', '0')
      root.style.setProperty('--control-gap', '0')
      root.style.setProperty('--control-opacity', '0')
      root.style.setProperty('--control-bg', 'transparent')
    }
    if (shiftPressed === true) {
      root.style.setProperty('--control-p', '1rem')
      root.style.setProperty('--control-gap', '0.5rem')
      root.style.setProperty('--control-opacity', '1')
      root.style.setProperty('--control-bg', '#ffffff09')
    }
  }, [shiftPressed])


  useEffect(() => {
    setMounted(true)
    const onMouseMove = (e: MouseEvent) => {
      if (!ctrlPressed) return
      const elements = document.elementsFromPoint(e.clientX, e.clientY)
      const element = elements.filter(e => e.id !== "tooltip" && !e.classList.contains("classnametag")).at(0) as HTMLDivElement
      if (element) {
        const tagName = element.tagName.toLowerCase();
        const className = element.className;
        const id = element.id;

        document.getElementById("tooltip-element-value")!.innerText = `<${ tagName }> ` + (id ? `#${ id }` : "");
        document.getElementById("tooltip-class-value")!.innerText = className.split(' ').sort().filter(
          e => { return !['outline', 'brightness', 'bg-'].some((prefix) => e.startsWith(prefix)) }
        ).join('\n');

        const tooltip = document.getElementById("tooltip")!;
        tooltip.style.bottom = `${ window.innerHeight - e.clientY + 10 }px`;
        tooltip.style.right = `${ window.innerWidth - e.clientX + 10 }px`;
        tooltip.style.top = `unset`
        tooltip.style.left = `unset`

        // Collision detection (top and left)
        const { width, height } = tooltip.getBoundingClientRect();
        if (e.clientY - 10 - height < 0) {
          tooltip.style.bottom = `unset`
          tooltip.style.top = `${ e.clientY + 10 }px`;
        }
        if (e.clientX - 10 - width < 0) {
          tooltip.style.right = `unset`
          tooltip.style.left = `${ e.clientX + 10 }px`;
        }

        // How to highlight hovered element and remove highlight from previous element
        const previousElement = document.querySelector(".outline");
        if (previousElement) {
          previousElement.classList.remove("outline");
        }
        element.classList.add("outline");
      }
    }

    window.addEventListener("mousemove", onMouseMove)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
    }
  }, [ctrlPressed])

  useEffect(() => {
    if (!ctrlPressed) {
      document.querySelectorAll(".outline").forEach((el) => {
        el.classList.remove("outline");
      })
    }
  }, [ctrlPressed])

  const Tooltip = mounted && ctrlPressed && <div ref={tooltipRef} id="tooltip" className="fixed z-20">
    <div className="p-4 rounded-md bg-black flexcol-3 border border-white/5  max-w-sm shadow-md relative">
      <div id="tooltip-element-value" className="font-semibold text-base leading-4!"></div>
      <div id="tooltip-class-value" className="font-mono tracking-tighter leading-4 text-xs"></div>
    </div>
  </div>

  return {
    Tooltip,
    rootRef,
    shiftPressed,
  }
}







export function ClassNameTag(props: {
  children?: React.ReactNode;
  className?: string,
  bare?: boolean,
  white?: boolean,
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.bare) return
    if (!ref.current) return
    const parent = ref.current.parentElement
    if (!parent) return
    if (getComputedStyle(parent).position === "static") {
      parent.style.position = "relative"
    }
    const current = ref.current
    current.style.position = "absolute"
    current.style.top = "0"
    current.style.left = "0"
  }, [])

  return (
    <div ref={ref} className={cn(
      "opacity-(--control-opacity) classnametag text-xs p-0.5 font-mono tracking-tighter text-muted/25 z-50",
      props.white ? "text-white" : "text-muted/25",
      props.className
    )}>
      {props.children}
    </div>
  )
}




// --- v2

export function useHelperControls2() {

  const rootRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null)

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [ctrlPressed, setCtrlPressed] = useState(false)
  const [shiftPressed, setShiftPressed] = useState(false)
  useEffect(() => {
    const keyPressed = (e: KeyboardEvent) => {
      if (e.key === "c") setCtrlPressed(prev => !prev)
      if (e.key === "s") setShiftPressed(prev => !prev)
    }
    document.addEventListener("keypress", keyPressed)
    return () => document.removeEventListener("keypress", keyPressed)
  }, [])

  useEffect(() => {
    if (!rootRef.current) return
    const root = rootRef.current;
    if (shiftPressed === false) {
      root.attributeStyleMap.set('--control-p', 0)
      root.attributeStyleMap.set('--control-gap', 0)
      root.attributeStyleMap.set('--control-opacity', 0)
      root.attributeStyleMap.set('--control-bg', 'transparent')
    }
    if (shiftPressed === true) {
      root.attributeStyleMap.set('--control-p', '1rem')
      root.attributeStyleMap.set('--control-gap', '0.5rem')
      root.attributeStyleMap.set('--control-opacity', '1')
      root.attributeStyleMap.set('--control-bg', '#ffffff09')
    }
  }, [shiftPressed])


  useEffect(() => {
    setMounted(true)
    const onMouseMove = (e: MouseEvent) => {
      if (!ctrlPressed) return
      const elements = document.elementsFromPoint(e.clientX, e.clientY)
      const element = elements.filter(e => e.id !== "tooltip" && !e.classList.contains("classnametag")).at(0) as HTMLDivElement
      if (element) {
        const tagName = element.tagName.toLowerCase();
        const className = element.className;
        const id = element.id;

        document.getElementById("tooltip-element-value")!.innerText = `<${ tagName }> ` + (id ? `#${ id }` : "");
        document.getElementById("tooltip-class-value")!.innerText = className.split(' ').sort().filter(
          e => { return !['outline', 'brightness', 'bg-'].some((prefix) => e.startsWith(prefix)) }
        ).join('\n');

        const tooltip = document.getElementById("tooltip")!;
        tooltip.style.bottom = `${ window.innerHeight - e.clientY + 10 }px`;
        tooltip.style.right = `${ window.innerWidth - e.clientX + 10 }px`;
        tooltip.style.top = `unset`
        tooltip.style.left = `unset`

        // Collision detection (top and left)
        const { width, height } = tooltip.getBoundingClientRect();
        if (e.clientY - 10 - height < 0) {
          tooltip.style.bottom = `unset`
          tooltip.style.top = `${ e.clientY + 10 }px`;
        }
        if (e.clientX - 10 - width < 0) {
          tooltip.style.right = `unset`
          tooltip.style.left = `${ e.clientX + 10 }px`;
        }

        // How to highlight hovered element and remove highlight from previous element
        const previousElement = document.querySelector(".outline");
        if (previousElement) {
          previousElement.classList.remove("outline");
        }
        element.classList.add("outline");
      }
    }

    window.addEventListener("mousemove", onMouseMove)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
    }
  }, [ctrlPressed])

  useEffect(() => {
    if (!ctrlPressed) {
      document.querySelectorAll(".outline").forEach((el) => {
        el.classList.remove("outline");
      })
    }
  }, [ctrlPressed])

  const Tooltip = mounted && ctrlPressed && <div ref={tooltipRef} id="tooltip" className="fixed z-20">
    <div className="p-4 rounded-md bg-black flexcol-3 border border-white/5  max-w-sm shadow-md relative">
      <div id="tooltip-element-value" className="font-semibold text-base leading-4!"></div>
      <div id="tooltip-class-value" className="font-mono tracking-tighter leading-4 text-xs"></div>
    </div>
  </div>

  return {
    Tooltip,
    rootRef,
  }
}