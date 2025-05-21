import { cn } from "lazy-cn";
import type { ComponentProps, SVGProps } from "react";

export function Header({ className, ...props }: ComponentProps<"header">) {
  return (
    <header {...props} className={cn(
      "bg-background h-16 flexrow-space-between/center px-6",
      className
    )} />
  )
}


export function CuidaSidebarExpandOutline(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Cuida Icons by Sysvale - https://github.com/Sysvale/cuida-icons/blob/main/LICENSE */}<path fill="currentColor" fillRule="evenodd" d="M6.416 3A4.416 4.416 0 0 0 2 7.416v8.833a4.416 4.416 0 0 0 4.416 4.417h11.168A4.416 4.416 0 0 0 22 16.248V7.416A4.416 4.416 0 0 0 17.584 3zm3.228 1.767v14.132h7.94a2.65 2.65 0 0 0 2.65-2.65V7.416a2.65 2.65 0 0 0-2.65-2.65h-7.94Z" clipRule="evenodd"></path></svg>
  )
}

export function Sidebar({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav {...props} className={cn(
      "w-60 px-8",
      "flexcol-4/stretch py-8 pt-3 z-20",
      "overflow-y-auto",
      className
    )} />
  )
}


export const sidebarMockPages = [
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


export function Content({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} className={cn(
      "text-base",
      "[&_h1]:text-4xl",
      "[&_h1]:font-semibold",
      "[&_h1]:tracking-tighter",
      "[&_h1]:mt-12",
      "[&_h1]:my-2",
      "[&_p]:my-3",
      "[&_p]:text-muted",
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
      <div className="flexrow-center/center aspect-video overflow-clip relative my-10 rounded-2xl xl:-mx-12 max-[576px]:rounded-none max-[576px]:-mx-6
                      "
      >
        {
          [
            // ...generateStarChart(1, 1000),
            ...generateClusteredStarChart(4, 200)].map(({ x, y, intensity }) => (
              <div key={`${ x }-${ y }-${ intensity }`}
                style={{
                  left: `${ x }%`,
                  top: `${ y }%`,
                  opacity: intensity - ((y / 100) / 5),
                }}
                className={cn(
                  // "size-[0.0625rem] rounded-full absolute bg-foreground",
                  "size-0.5 rounded-full absolute bg-foreground",
                )} />
            ))
        }
        <div className="w-full h-full absolute bg-gradient-to-t from-background to-background/75" />

        <div className="text-7xl font-medium text-muted tracking-tighter scale-200 -translate-y-5 text-transparent bg-clip-text bg-gradient-to-t from-transparent to-muted/25">
          Purpose
        </div>


        <div className="size-120 rounded-full absolute translate-y-60 overflow-clip bg-background
                        "/>
        <div className="size-120 rounded-full absolute translate-y-60
                        bg-radial-[150%_150%_at_90%_90%,transparent_50%,color-mix(in_srgb,var(--color-primary)_35%,transparent)_70%,var(--color-primary)_80%]
                        "/>
        <div className="size-120 rounded-full absolute translate-y-60
                        bg-radial-[55%_55%_at_52%_52%,transparent_90%,color-mix(in_srgb,var(--color-foreground)_20%,transparent)_100%]
                        shadow-[0_0_2rem_1rem_var(--color-background)]
                        "/>
        <div className="size-120 rounded-full absolute translate-y-60
                        inset-shadow-sm inset-shadow-foreground/15
                        "/>
        <div className="size-120 rounded-full absolute translate-y-60
                        inset-shadow-sm inset-shadow-foreground blur-[10px]
                        "/>
        <div className="w-full h-full absolute bg-gradient-to-t from-primary/35 to-primary/10" />

      </div>
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

export function SidebarItemList() {
  return <>
    {
      sidebarMockPages.map((group, i) => {
        return (
          <div key={i}>
            <div className="text-sm text-muted/50 font-medium shrink-0">
              {group.groupname}
            </div>
            {
              group.items.map((item, j) => {
                if (i === 0 && j === 1) {
                  return (
                    <div key={j} className="p-1.5 px-4 -mx-4 rounded-md bg-primary/25 text-sm text-primary font-medium">
                      {item}
                    </div>
                  )
                }
                return (
                  <div key={j} className="p-1.5 px-4 -mx-4 rounded-md hover:bg-white/5 text-sm">
                    {item}
                  </div>
                )
              })
            }
          </div>
        )
      })
    }
  </>
}

export function NavbarCenter() {
  return (
    <nav className="navbar-center flexrow-1/center text-sm text-muted">
      <div className="px-3 py-0.5 rounded-full hover:bg-white/5">Themes</div>
      <div className="px-3 py-0.5 rounded-full bg-white text-background font-semibold">Primitives</div>
      <div className="px-3 py-0.5 rounded-full hover:bg-white/5">Icons</div>
      <div className="px-3 py-0.5 rounded-full hover:bg-white/5">Colors</div>
    </nav>
  )
}

export function NavbarEnd() {
  return (
    <nav className="navbar-end md:flexrow-2/center text-sm text-muted hidden">
      <div className="px-2 underline underline-offset- decoration-muted/50">Docs</div>
      <div className="px-2 underline underline-offset- decoration-muted/50">Github</div>
      <div className="px-2 underline underline-offset- decoration-muted/50">Discord</div>
    </nav>
  )
}

export function TableOfContent() {
  return (
    <>
    </>
  )
}

function seededRandom(seed = 123) {
  let x = seed % 2147483647;
  if (x <= 0) x += 2147483646;
  return () => {
    x = (x * 16807) % 2147483647;
    return (x - 1) / 2147483646;
  };
}

function generateStarChart(seed = 123, count: number) {
  const rng = seededRandom(seed);

  return Array.from({ length: count }, () => ({
    x: rng() * 100,
    y: rng() * 100,
    intensity: rng(), // 0..1
  }));
}

const generateClusteredStarChart = (seed = 123, count: number, clusters = 50, clusterRatio = 0.9, clusterRadius = 10) => {
  const r = seededRandom(seed);
  const centers = Array.from({ length: clusters }, () => [r() * 100, r() * 100]);

  return Array.from({ length: count }, () => {
    if (r() < clusterRatio) {
      const [cx, cy] = centers[Math.floor(r() * centers.length)];
      const angle = r() * 2 * Math.PI;
      const radius = r() * clusterRadius;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)), intensity: r() };
    } else {
      return { x: r() * 100, y: r() * 100, intensity: r() };
    }
  });
};