"use client"

import { useState, type ComponentProps, type SVGProps } from "react";
import { MockLogo } from "../logo";
import { cn } from "lazy-cn";
import { Button } from "@/lib/components/button";

export default function DocsLayout4() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen
                    [--page-px:1.5rem] sm:[--page-px:1.5rem]
                    [--header-h:calc(var(--spacing)*16)]
                    [--content-w:var(--container-xl)]
                    [--sidebar-w:calc(var(--spacing)*60)]
    "
    >

      <header className="navbar 
                       bg-background h-(--header-h) flexrow-space-between/center px-(--page-px)
                         fixed w-[100vw] top-0 bg-zinc-900
                         ">
        <div className="navbar-start flexrow-4/center">
          <MockLogo />
          <Button icon className="size-8 p-2 block" onClick={() => setSidebarOpen(prev => !prev)}>
            <CuidaSidebarExpandOutline />
          </Button>
        </div>
        <nav className="navbar-center flexrow-1/center text-sm text-muted">
          <div className="px-3 py-0.5 rounded-full hover:bg-white/5">Themes</div>
          <div className="px-3 py-0.5 rounded-full bg-white text-background font-semibold">Primitives</div>
          <div className="px-3 py-0.5 rounded-full hover:bg-white/5">Icons</div>
          <div className="px-3 py-0.5 rounded-full hover:bg-white/5">Colors</div>
        </nav>
        <nav className="navbar-end md:flexrow-2/center text-sm text-muted hidden">
          <div className="px-2 underline underline-offset- decoration-muted/50">Docs</div>
          <div className="px-2 underline underline-offset- decoration-muted/50">Github</div>
          <div className="px-2 underline underline-offset- decoration-muted/50">Discord</div>
        </nav>
      </header>

      <nav className="sidebar 
                      -translate-x-full
                      min-[1056px]:translate-x-0
                      data-open:translate-x-0
                      w-(--sidebar-w) h-[calc(100lvh-var(--header-h))] top-(--header-h) left-0 bg-zinc-900 px-(--page-px)
                      overflow-y-auto pb-4 flexcol-4/stretch
                      fixed
      " data-open={sidebarOpen ? "" : undefined}>
        {sidebarMockPages.map((group, i) => {
          return (
            <div key={i}>
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
      </nav>

      <div className="content">
        <div className="content-inner mt-(--header-h) ml-[max(calc(50vw-var(--content-w)/2),0px)] max-w-(--content-w) pt-12 px-(--page-px)">
          <Content>
            <h1>
              Centering Layout
            </h1>
          </Content>
        </div>
      </div>

      <div className="content-nav
                      fixed
                      left-[calc(100vw-var(--sidebar-w))] top-(--header-h)
                      p-4 pt-16 w-60

                      translate-x-full
                      min-[1056px]:translate-x-0

                      flexcol-4
      ">
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
  )
}






function Content({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} className={cn(
      "text-base",
      "[&_h1]:text-4xl",
      "[&_h1]:font-semibold",
      "[&_h1]:tracking-tighter",
      "[&_h1]:mt-12",
      "[&_h1]:my-2",
      "[&_p]:my-3",
      "[&_h2]:text-2xl",
      "[&_h2]:font-semibold",
      "[&_h2]:tracking-tight",
      "[&_h2]:my-2",
      "[&_h3]:text-lg",
      "[&_h3]:font-semibold",
      "[&_h3]:tracking-tight",
      "[&_h3]:my-2",
      className)}>
      {children}
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