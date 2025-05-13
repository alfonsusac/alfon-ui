"use client"

import { useEffect, useState, type ComponentProps } from "react"
import { ClassNameTag } from "../controls"
import { Button } from "@/lib/components/button"
import { MockLogo } from "../logo"
import { cn } from "lazy-cn"

export default function DocsLayoutStudyAgain() {

  const [isOPressed, setIsOPressed] = useState(false)
  const [isLPressed, setIsLPressed] = useState(false)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'o') setIsOPressed(prev => !prev)
      if (event.key === 'l') setIsLPressed(prev => !prev)
    }
    
    if (isLPressed) {
      document.body.style.direction = "rtl"
    } else {
      document.body.style.direction = ""
    }

    if (isOPressed) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isOPressed, isLPressed])



  return (
    <div className="root"
      style={{
        "--page-w": "var(--container-6xl)",
        "--page-content-w": "var(--container-xl)",
        "--header-h": "calc(var(--spacing) * 16)",
        "--page-p": "calc(var(--spacing) * 6)",

        "--color-foreground": "rgba(190, 190, 190, 1)",
        "--color-primary": "rgba(159, 159, 159, 1)",
        "--color-background": "#18181b",
      }}
    >
      <div className="top-navbar
                      fixed h-(--header-h) w-[100vw] bg-blue-500/5 px-(--page-p)
                      flex items-center justify-between
                      ">
        <MockLogo />
        <span className="text-xs min-w-0 text-nowrap tracking-tighter font-mono italic">
          h-(--header-h) w-[100vw] flex justify-center <br />{'>'} max-w-(--page-w) px-(--page-p)
        </span>

        <div>
          <Button primary>
            Login
          </Button>
        </div>
      </div>


      <div className="sidebar
                      fixed w-72 bg-green-500/5
                      top-(--header-h) bottom-0 left-0
                      overflow-y-auto
                      p-4
                      ">
        <ClassnameLabel>fixed w-72<br/>top-(--header-h) bottom-0</ClassnameLabel>
        {sidebarMockPages.map((group, i) => {
          return (
            <div key={i} className="p-3 px-5">
              <div className="text-sm text-muted/50 font-semibold mb-2">
                {group.groupname}
              </div>
              {group.items.map((item, j) => {
                return (
                  <div key={j} className="p-2 px-5 -mx-5 rounded-md hover:bg-white/5">
                    {item}
                  </div>
                )
              })}
            </div>
          )
        })}
        Hello World
      </div>



      <div className="content
                      flex bg-white/5 pt-(--header-h)"
        style={{ "--w": "var(--page-content-w)" }}
      >
        <div className="content-left-padding
                      bg-red-500/5 font-mono text-xs
                        tracking-tighter min-w-0 text-nowrap overflow-hidden text-end italic
                        w-[calc(100vw/2-var(--w)/2)]
                        
                      ">
          w-[calc(100vw/2-var(--w)/2)]
        </div>
        <div className="content-center
                        max-w-(--w) w-full p-8 bg-white/5
                        pt-(--header-h)
                        ">
          <span className="text-xs min-w-0 text-nowrap tracking-tighter font-mono italic">
            max-w-(--w) w-full
          </span>
          <Button primary onClick={() => {
            setIsOPressed(prev => !prev)
          }}>
            Toggle Overlay
          </Button>
          <Content />
        </div>
        <div className="content-nav
                      w-40
                      ">
          Quick Nav

        </div>
      </div>



    </div>
  )
}


function Content() {
  return (
    <div className="
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
      <p>Press O to toggle on/off body's overflow.</p>
      <br />
      <h1>
        Centering Layout
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
  )
}


function ClassnameLabel(props: ComponentProps<"div">) {
  return (
    <span {...props} className={cn(
      "text-xs min-w-0 text-nowrap tracking-tighter font-mono italic leading-5!",
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