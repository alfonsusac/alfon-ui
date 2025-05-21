"use client"

import { useEffect, useState, type ComponentProps, type SVGProps } from "react"
import { ClassNameTag, useHelperControls } from "../controls"
import { Button } from "@/lib/components/button"
import { MockLogo } from "../logo"
import { cn } from "lazy-cn"

export default function DocsLayoutStudyAgain() {

  const {
    Tooltip,
    rootRef,
    shiftPressed
  } = useHelperControls()

  const [isOPressed, setIsOPressed] = useState(false)
  const [isLPressed, setIsLPressed] = useState(false)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'o') setIsOPressed(prev => !prev)
      if (event.key === 'l') setIsLPressed(prev => !prev)
    }
    if (isLPressed) document.body.style.direction = "rtl"
    else document.body.style.direction = ""

    if (isOPressed) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isOPressed, isLPressed])

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)


  return (
    <div ref={rootRef} data-debug={shiftPressed ? "" : undefined} className="root group"
      style={{
        "--page-w": "var(--container-6xl)",
        "--page-content-w": "var(--container-xl)",
        "--header-h": "calc(var(--spacing) * 16)",
        "--page-p": "calc(var(--spacing) * 6)",
        "--sidebar-w": "calc(var(--spacing) * 60)",

        "--color-foreground": "rgba(190, 190, 190, 1)",
        "--color-primary": "rgba(159, 159, 159, 1)",
      }}
    >
      {Tooltip}
      <div
        className="top-navbar
                   fixed h-(--header-h) w-[100vw] group-data-debug:bg-blue-500/5 px-2 pt-2
                   flex items-center justify-between bg-background
                   ">
        <div className="top-navbar-inner
                        w-full h-full
                        flex items-center justify-between
                        bg-[color-mix(in_srgb,#fff_5%,var(--bg))] rounded-lg
                        p-2 pl-4 pr-2.5
        
        ">
          <div className="flexrow-4/center">
            <Button icon className="size-8 p-2
              block
              min-[1054px]:hidden
            "
              onClick={() => {
                setIsSidebarOpen(prev => !prev)
              }}
            >
              <CuidaSidebarExpandOutline />
            </Button>
            <MockLogo />
          </div>
          <ClassnameLabel>
            h-(--header-h) w-[100vw] flex justify-center <br />{'>'} max-w-(--page-w) px-(--page-p)
          </ClassnameLabel>
          <div className="flexrow-2/center">
            <Button>
              Login
            </Button>

          </div>
        </div>

      </div>


      <div data-hl={shiftPressed}
        data-open={isSidebarOpen ? "" : undefined}
        // translate-x-[clamp(calc(var(--sidebar-w)*-1),calc(1000*100vw-(var(--sidebar-w)*2+var(--page-content-w))*1000),0px)]

        // how to get min-w arbitrary:
        // sidebar-w * 2 + page-w-content
        // 480px + 576px  = 1056px
        className="sidebar
                  transition-[translate,opacity]
                  duration-[300ms,150ms]

                  

                  opacity-0
                  -translate-x-full
                  
                  data-open:translate-x-0
                  min-[1056px]:translate-x-0

                  data-open:opacity-100
                  min-[1056px]:opacity-100

                  max-w-xl
                  
                  fixed w-(--sidebar-w) group-data-debug:bg-green-500/5
                  bottom-0 left-0 h-[calc(100svh-(var(--header-h)))]
                  overflow-y-auto
                  p-2 pt-2 empty:hidden
                  ">
        <div className="bg-[color-mix(in_srgb,#fff_5%,var(--bg))] rounded-lg overflow-y-auto h-full p-2 overscroll-none">
          <ClassnameLabel>fixed w-72<br />top-(--header-h) bottom-0</ClassnameLabel>
          {sidebarMockPages.map((group, i) => {
            return (
              <div key={i} className="p-3 px-4">
                <div className="text-sm text-muted/50 font-medium mb-2">
                  {group.groupname}
                </div>
                {group.items.map((item, j) => {
                  return (
                    <div key={j} className="p-1.5 px-4 -mx-4 rounded-md hover:bg-white/5 text-sm">
                      {item}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>



      <div data-hl={shiftPressed} className="content
                      flex group-data-debug:bg-white/5 pt-(--header-h)"
        style={{ "--w": "var(--page-content-w)" }}
      >
        <div data-hl={shiftPressed} className="content-left-padding
                        group-data-debug:bg-red-500/5 font-mono text-xs
                        tracking-tighter text-nowrap overflow-hidden text-end italic

                        w-[calc((100vw)/2-var(--w)/2)]
                        min-w-0
                      ">
          <ClassnameLabel>
            w-[calc(100vw/2-var(--w)/2)]
          </ClassnameLabel>
        </div>
        <div className="content-center
                        max-w-(--w) w-full p-8 group-data-debug:bg-white/5

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
          <ClassnameLabel>
            max-w-(--w) w-full
          </ClassnameLabel>
          <h1>
            Centering Layout
          </h1>
          <div className="flexcol-2">

            <Button primary onClick={() => {
              setIsOPressed(prev => !prev)
            }}>
              Toggle Root Overflow
            </Button>
            <p>Press O to toggle on/off body's overflow. </p>
          </div>
          <Content />
        </div>


      </div>

      <div

        // how to get min-w arbitrary:
        // content-nav-w * 2 + page-w-content
        // 480px + 576px  = 1056px
        className="content-nav
                      transition-[translate,opacity]
                      duration-[300ms,150ms]

                      translate-x-full
                      opacity-0
                      min-[1056px]:translate-x-0
                      min-[1056px]:opacity-100
                      w-60
                      fixed top-(--header-h) 
                      p-4 pt-16 group-data-debug:bg-yellow-500/5
                      flexcol-4

                      left-[calc(100vw-var(--spacing)*60)]
                      ">
        <div className="content-nav-inner
                        p-6 w-full h-full rounded-lg
                      bg-[color-mix(in_srgb,#fff_5%,var(--bg))]
                      flexcol-4
                      ">
          <ClassnameLabel>
            fixed top-(--header-h)<br /> left-[calc(50vw+var(--page-content-w)/2)]
          </ClassnameLabel>
          <div className="font-semibold text-base">
            Quick Nav
          </div>
          <div className="flexcol-2 text-muted text-sm">
            <div>Vision</div>
            <div>Key Features</div>
            <div>Acessible</div>
            <div>Unstyled</div>
            <div>Compatible</div>
          </div>
        </div>
      </div>



    </div>
  )
}


function Content() {
  return (
    <div>

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
  )
}


function ClassnameLabel(props: ComponentProps<"div">) {
  return (
    <span {...props} className={cn(
      "hidden",
      "text-xs min-w-0 text-nowrap tracking-tighter font-mono italic leading-4! group-data-debug:block",
      props.className,
    )} />
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
      "Dialog",
      "Tooltip",
      "Accordion",
      "Dropdown",
      "Slider",
      "Tabs",
      "Progress",
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
  },
  {
    "groupname": "Resources",
    "items": [
      "Changelog",
      "Contributing",
      "FAQ",
    ],
  },
]


function CuidaSidebarExpandOutline(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Cuida Icons by Sysvale - https://github.com/Sysvale/cuida-icons/blob/main/LICENSE */}<path fill="currentColor" fillRule="evenodd" d="M6.416 3A4.416 4.416 0 0 0 2 7.416v8.833a4.416 4.416 0 0 0 4.416 4.417h11.168A4.416 4.416 0 0 0 22 16.248V7.416A4.416 4.416 0 0 0 17.584 3zm3.228 1.767v14.132h7.94a2.65 2.65 0 0 0 2.65-2.65V7.416a2.65 2.65 0 0 0-2.65-2.65h-7.94Z" clipRule="evenodd"></path></svg>
  )
}