"use client"

import { Button } from "@/lib/components/button"
import { useHelperControls2 } from "../controls"
import { use, useEffect, useRef, useState } from "react"
import { cn } from "lazy-cn"

export default function LayoutStudy2() {

  const {
    Tooltip,
    rootRef,
  } = useHelperControls2()

  const [is3d, setIs3d] = useState(false)
  useEffect(() => {
    const onKeyPress = (event: KeyboardEvent) => {
      if (event.key === "p") {
        setIs3d(prev => !prev)
      }
    }
    document.addEventListener("keypress", onKeyPress)
    return () => document.removeEventListener("keypress", onKeyPress)
  }, [])
  const rootviewref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!is3d) {
      rootviewref.current?.attributeStyleMap.set('--rotateX', '0deg')
      rootviewref.current?.attributeStyleMap.set('--rotateZ', '0deg')
      rootviewref.current?.attributeStyleMap.set('--panX', '0px')
      rootviewref.current?.attributeStyleMap.set('--panY', '0px')
    }
  }, [is3d])


  useEffect(() => {
    if (!is3d) return

    const handleMouseDown = (event: MouseEvent) => {
      if (event.buttons !== 1) return // Only handle left mouse button
      const initMousePos = { x: event.clientX, y: event.clientY }

      if (!rootviewref.current) return
      const currRotateX = Number((rootviewref.current?.attributeStyleMap.get('--rotateX') ?? '0deg').toString().split('deg')[0])
      const currRotateZ = Number((rootviewref.current?.attributeStyleMap.get('--rotateZ') ?? '0deg').toString().split('deg')[0])
      const currPanX = Number((rootviewref.current?.attributeStyleMap.get('--panX') ?? '0px').toString().split('px')[0])
      const currPanY = Number((rootviewref.current?.attributeStyleMap.get('--panY') ?? '0px').toString().split('px')[0])

      const handleMouseMove = (event: MouseEvent) => {
        if (event.buttons === 0) {
          document.removeEventListener("mousemove", handleMouseMove)
          return
        }
        const dx = event.clientX - initMousePos.x
        const dy = event.clientY - initMousePos.y

        if (event.shiftKey) {
          // curr + difference but adjust to angle


          rootviewref.current?.attributeStyleMap.set('--panX', `${ currPanX + dx }px`)
          rootviewref.current?.attributeStyleMap.set('--panY', `${ currPanY + dy }px`)
        } else {
          rootviewref.current?.attributeStyleMap.set('--rotateX', `${ currRotateX + dy * -0.1 }deg`)
          rootviewref.current?.attributeStyleMap.set('--rotateZ', `${ currRotateZ + dx * -0.1 }deg`)
        }


      }
      document.addEventListener("mousemove", handleMouseMove)
    }
    document.addEventListener("mousedown", handleMouseDown)
    return () => document.removeEventListener("mousedown", handleMouseDown)
  }, [is3d])

  const items = ['a']

  return (
    <div className={cn(
      "view3droot",
      is3d ? "override" : ""
    )} ref={rootviewref} style={{
      "--baseZoomOut": is3d ? "-300px" : "0px",
      "--elevation": is3d ? "50px" : "0px",
      "--control-bg": is3d ? "var(--color-background)" : "",
      "--control-border": is3d ? "#fff3 1px solid" : "",
      "--control-overflow": is3d ? "visible" : "var(--asdf)",
      "--perspective": is3d ? "1000px" : "1000px",
      "--rotate-transition": is3d ? "none" : "transform 0.5s ease-in-out, transform-origin 0.5s ease-in-out",
    }}>
      <div>
        <div>
          <div>
            <div
              ref={rootRef}
              className="
                 transition-[padding]
                 gap-(--control-gap)
                 bg-(--control-bg)
                 leading-3
                 text-foreground
                 text-sm


                 bg-zinc-900
                 min-h-screen
                 flexcol-2/stretch
                 "
              style={{
                "--page-width": "var(--container-5xl)",
                "--page-width-sm": "var(--container-4xl)",
                "--page-padding": "1rem",
                "--navbar-height": "3.5rem",

                "--color-foreground": "rgba(190, 190, 190, 1)",
                "--color-primary": "rgba(159, 159, 159, 1)",
                "--color-background": "#18181b",
              }}
            >
              {Tooltip}

              <header className="header-full
                         fixed top-0 z-20 outline outline-muted/25 bg-background w-full h-(--navbar-height)
      ">
                <div className="header-inner
                        max-w-(--page-width) mx-auto flexrow-space-between/center px-(--page-padding) h-full
        ">
                  <div className="header-left
                          flexrow-10/center
          ">
                    <div className="font-semibold text-base flexrow-2/center tracking-tight">
                      <div className="size-5 rounded-full bg-linear-to-tl from-transparent via-transparent via-40% to-current " />
                      Purpose
                    </div>

                    <div className="hidden min-[52rem]:flexrow-8 text-muted/50 text-sm">
                      <div>Product</div>
                      <div>Resources</div>
                      <div>Pricing</div>
                      <div>Customer</div>
                      <div>Blog</div>
                      <div>Contact</div>
                    </div>
                  </div>

                  <div className="flexrow-4">
                    <Button sm>Login</Button>
                    <Button sm>Register</Button>
                  </div>

                </div>
              </header>

              <div className="main-full
                      grow flex max-w-(--page-width) mx-auto w-full
                      pt-(--navbar-height)
      ">
                <aside className="sidebar-full
                          w-60 shrink-0 self-stretch flex min-h-0 overflow-visible
        ">
                  <div className="sidebar-inner
                          sticky top-(--navbar-height) p-(--page-padding) h-screen flex flex-col items-stretch grow pr-8
                          overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]
          ">
                    {sidebarMockPages.map((group, i) => {
                      return (
                        <div key={i} className="p-3">
                          <div className="text-sm text-muted/50 font-semibold mb-2">
                            {group.groupname}
                          </div>
                          {group.items.map((item, j) => {
                            return (
                              <div key={j} className="p-3 -mx-3 rounded-md hover:bg-white/5">
                                {item}
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </aside>

                <main className="bg-(--control-bg) p-(--control-p)
                         w-full 
        ">
                  <div className="max-w-xl mx-auto
                    text-base
                    [&_h1]:text-4xl
                    [&_h1]:font-semibold
                    [&_h1]:tracking-tighter
                    [&_h1]:mt-12
                    [&_h1]:my-2

                    [&_p]:my-3

                    [&_h2]:text-2xl
                    [&_h2]:font-semibold
                    [&_h2]:tracking-tight
                    [&_h2]:my-2

                    [&_h3]:text-lg
                    [&_h3]:font-semibold
                    [&_h3]:tracking-tight
                    [&_h3]:my-2
                  ">
                    <h1>
                      Introduction
                    </h1>
                    <p>
                      This is a minimal component toolkit built for precision, adaptability, and developer clarity. Use it as the structural core of your interface system, or integrate individual elements into existing codebases as needed.
                    </p>
                    <br />
                    <h2>
                      Vision
                    </h2>
                    <p>
                      There is broad agreement on how standard interface elements should behave—accordions, checkboxes, dropdowns, dialogs, sliders, and more. These patterns are well-established in interface design literature and user expectation.
                    </p>
                    <p>
                      Yet, native support on the web remains inconsistent. Some patterns have no built-in equivalents, others lack flexibility, and many cannot be customized without rewriting behavior from scratch.
                    </p>
                    <p>
                      Developers often resort to building these patterns manually—a process that is complex, error-prone, and rarely accessible or performant.
                    </p>
                    <p>
                      Our mission is to maintain a set of reliable, open components that elevate interface foundations across projects, frameworks, and teams.
                    </p>

                    <br />
                    <h2>Key Features</h2>

                    <h3>Accessible</h3>
                    <p>
                      Components follow accessibility conventions closely. Focus handling, keyboard support, and relevant ARIA attributes are integrated by default, reducing the burden on developers. Refer to our accessibility section for implementation details.
                    </p>
                    <br />

                    <h3>Unstyled</h3>
                    <p>
                      Components are delivered without default visual styling. You define all appearance rules using your preferred styling system, from CSS modules to utility-first approaches. See the styling guide for integration tips.
                    </p>
                    <br />

                    <h3>Composable</h3>
                    <p>
                      Each component is designed for maximum flexibility. You can wrap, extend, or inject behavior as needed. This modular design allows deep customization without forking or rewriting core logic.
                    </p>
                    <br />

                    <h3>Uncontrolled by default</h3>
                    <p>
                      Most components function in uncontrolled mode initially, managing their own state internally. However, they can be fully controlled if required. This dual-mode design makes them quick to start with and powerful to scale.
                    </p>
                    <br />

                    <h3>Developer-first</h3>
                    <p>
                      APIs are type-safe, minimal, and predictable. Every component aligns to a consistent interaction model. Advanced patterns like render-as-child are supported for full DOM control and flexibility.
                    </p>
                    <br />

                    <h3>Modular adoption</h3>
                    <p>
                      Install only the components you need. The package is modular and tree-shakeable, ensuring that unused code does not increase your bundle size. This approach helps avoid dependency bloat and versioning conflicts.
                    </p>
                  </div>
                </main>

              </div>

              <footer className="footer-full
                         outline outline-muted/25
      ">

                <div className="footer-inner
                        max-w-(--page-width) mx-auto flexrow-space-between/center p-(--page-padding)
        ">
                  Made by alfonsusac
                </div>

              </footer>

            </div>
          </div>
        </div>
      </div>
    </div>
  )

}


const sidebarMockPages = [
  {
    "groupname": "Overview",
    "items": [
      "Introduction",
      "Getting Started",
      "Installation",
    ],
  },
  {
    "groupname": "Components",
    "items": [
      "Button",
      "Input",
      "Select",
      "Checkbox",
      "Radio",
      "Switch",
      "Textarea",
    ],
  },
  {
    "groupname": "Utilities",
    "items": [
      "Colors",
      "Spacing",
      "Typography",
      "Layout",
      "Grid",
    ],
  },
  {
    "groupname": "Advanced",
    "items": [
      "Theming",
      "Animations",
      "Accessibility",
    ],
  }
]