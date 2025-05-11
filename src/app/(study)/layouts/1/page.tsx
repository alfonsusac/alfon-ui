"use client"

import { Button } from "@/lib/components/button";
import { cn } from "lazy-cn";
import { useEffect, useRef, useState } from "react";

export default function LayoutStudy1() {

  const [sectionCount, setSectionCount] = useState(4)
  const sections = Array.from({ length: sectionCount }, (_, i) => ({
    ...sectionMockTitleAndDescriptions[i % sectionMockTitleAndDescriptions.length],
  }));

  const [mounted, setMounted] = useState(false);

  // useEffect(() => {
  //   setMounted(true)
  //   const onMouseMove = (e: MouseEvent) => {
  //     const elements = document.elementsFromPoint(e.clientX, e.clientY)
  //     const element = elements.filter(e => e.id !== "tooltip").at(0) as HTMLDivElement
  //     if (element) {
  //       const tagName = element.tagName.toLowerCase();
  //       const className = element.className;
  //       const id = element.id;

  //       document.getElementById("tooltip-element-value")!.innerText = `<${tagName}> ` + (id ? `#${ id }` : "");
  //       document.getElementById("tooltip-class-value")!.innerText = className.split(' ').sort().filter(
  //         e => { return !['outline', 'brightness', 'bg-'].some((prefix) => e.startsWith(prefix)) }
  //       ).join('\n');

  //       const tooltip = document.getElementById("tooltip")!;
  //       tooltip.style.bottom = `${ window.innerHeight - e.clientY + 10 }px`;
  //       tooltip.style.right = `${ window.innerWidth - e.clientX + 10 }px`;
  //       tooltip.style.top = `unset`
  //       tooltip.style.left = `unset`

  //       // Collision detection (top and left)
  //       const { width, height } = tooltip.getBoundingClientRect();
  //       if (e.clientY - 10 - height < 0) {
  //         tooltip.style.bottom = `unset`
  //         tooltip.style.top = `${ e.clientY + 10 }px`;
  //       }
  //       if (e.clientX - 10 - width < 0) {
  //         tooltip.style.right = `unset`
  //         tooltip.style.left = `${ e.clientX + 10 }px`;
  //       }

  //       // How to highlight hovered element and remove highlight from previous element
  //       const previousElement = document.querySelector(".outline");
  //       if (previousElement) {
  //         previousElement.classList.remove("outline");
  //       }
  //       element.classList.add("outline");
  //     }
  //   }

  //   window.addEventListener("mousemove", onMouseMove)
  //   return () => {
  //     window.removeEventListener("mousemove", onMouseMove)
  //   }
  // })


  return (
    <div className="p-2
                    leading-3
                    text-muted
                    text-sm
                    bg-darker-3
                    min-h-screen
                    flexcol-2/stretch"
      style={{
        "--page-width": "var(--container-5xl)",
        "--page-width-sm": "var(--container-3xl)",
        "--page-padding": "1rem",
        "--color-foreground": "rgba(159, 159, 159, 1)",
        "--color-primary": "rgba(159, 159, 159, 1)",
        "--color-background": "rgba(39, 39, 42, 1)",
      }}
    >
      {/* {mounted && <>
        <div id="tooltip" className="fixed z-20">
          <div className="p-4 rounded-md bg-black flexcol-3 border border-white/5  max-w-sm shadow-md relative">
            <div id="tooltip-element-value" className="font-semibold text-base leading-4!"></div>
            <div id="tooltip-class-value" className="font-mono tracking-tighter leading-4"></div>
          </div>
        </div>
      </>} */}
      {/* Header */}
      <header className="bg-darker-1 sticky top-0 z-10 p-4">
        <ClassNameTag>header.sticky.top-0.z-10</ClassNameTag>
        <div className="max-w-(--page-width) mx-auto flexrow-space-between/center px-(--page-padding) h-14 bg-darker-0">
          <ClassNameTag>div.max-w-(--page-width).mx-auto.px-(--page-padding).flex.flex-row.justify-betweens.items-center</ClassNameTag>
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

          <div className="flexrow-4">
            <Button sm>Login</Button>
            <Button sm>Register</Button>
          </div>
        </div>
      </header>

      <main className="bg-darker-2 p-4 space-y-2">
        <ClassNameTag>main</ClassNameTag>

        <section className="bg-darker-1">
          <ClassNameTag>section</ClassNameTag>

          <div className="max-w-(--page-width-sm) mx-auto w-full bg-darker-0 flexcol-8 pt-20 pb-20 px-(--page-padding)">
            <ClassNameTag>div.max-w-(--page-width-sm).mx-auto.flex.flex-col.gap-8.py-20.px-(--page-padding)</ClassNameTag>

            <h1 className="text-5xl font-medium tracking-tighter max-w-2xl accent-amber-50">
              Purpose is a linear-built tool for building and planning products
            </h1>

            <p className="text-xl font-medium tracking-tight max-w-lg text-current/75">
              Meet the system for modern software development. Streamline issues, projects, and product roadmaps.
            </p>

            <div className="flexrow-4/center">
              <Button primary xl>Start Building</Button>
            </div>

          </div>
        </section>

        {sections.map((data, i) => {
          return (
            <section key={i} className="bg-darker-1">
              <ClassNameTag>section</ClassNameTag>

              <div key={i} className={cn(
                "max-w-(--page-width-sm) mx-auto bg-darker-0 py-24 px-(--page-padding) flexcol-16",
              )}>
                <ClassNameTag>div.max-w-(--page-width-sm) mx-auto flex flex-col gap-16 py-24 px-(--page-padding)</ClassNameTag>


                {/* Section Header */}
                <div className={cn(
                  data.layout === "col" ? "flexcol-4/stretch" : "flexrow-8/center",
                )}>
                  <ClassNameTag>div.{data.layout === "col" ? "flex.flex-col.gap-4.items-stretch" : "flex.gap-8.items-center"}</ClassNameTag>

                  <h2 className="text-6xl font-medium tracking-tighter max-w-2xl text-pretty">
                    {data.title}
                  </h2>

                  <p className="text-base font-medium tracking-tight max-w-lg text-current/75 max-w-sm">
                    {data.description}
                  </p>
                </div>

                {/* Content */}

                <div className={cn(
                  "w-screen h-120 bg-white/5 relative left-1/2 -translate-x-1/2",
                  data.contentWidth === "page" && "max-w-(--page-width) px-(--page-padding) rounded-xl",
                  data.contentWidth === "content" && "max-w-(--page-width-sm) px-(--page-padding) rounded-xl",
                  data.contentWidth === "full" && "max-w-screen",
                )}>
                  <ClassNameTag>div.w-screen.h-120.relative.left-1/2.-translate-x-1/2
                    <br />
                    {data.contentWidth === "page" && "max-w-(--page-width) px-(--page-padding)"}
                    {data.contentWidth === "content" && "max-w-(--page-width-sm) px-(--page-padding)"}
                    {data.contentWidth === "full" && "max-w-screen"}

                  </ClassNameTag>

                </div>


              </div>
            </section>
          )
        })}
      </main>

      <footer className="bg-darker-1">
        <ClassNameTag>footer</ClassNameTag>

        <div className="max-w-(--page-width) mx-auto flexrow min-h-80 bg-darker-0 px-(--page-padding) py-16">
          <ClassNameTag>div.max-w-(--page-width).mx-auto.flex.px-(--page-padding).py-16</ClassNameTag>

          <div className="text-2xl font-semibold tracking-tighter">
            Purpose
          </div>
        </div>

      </footer>

    </div >
  )
}



const sectionMockTitleAndDescriptions = [
  {
    title: "Made for modern product teams",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    layout: "row",
    contentWidth: "page",
  },
  {
    title: "Set the product direction",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    layout: "col",
    contentWidth: "content",

  },
  {
    title: "Issue tracking you’ll enjoy using",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    layout: "col",
    contentWidth: "full",
  },
  {
    title: "Collaborate across tools and teams",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    layout: "row",
    contentWidth: "page",
  },
  {
    title: "Built on strong foundations",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    layout: "col",
    contentWidth: "content",
  },
]

function getModifiedComputedStyles(element: HTMLElement) {
  const computed = window.getComputedStyle(element);
  const defaultEl = document.createElement(element.tagName);
  document.body.appendChild(defaultEl);
  const defaultComputed = window.getComputedStyle(defaultEl);

  const modified: {
    [key: string]: string;
  } = {};

  for (let i = 0; i < computed.length; i++) {
    const prop = computed[i];
    const value = computed.getPropertyValue(prop);
    const defaultValue = defaultComputed.getPropertyValue(prop);

    if (value !== defaultValue) {
      modified[prop] = value;
    }
  }

  document.body.removeChild(defaultEl);
  return modified;
}

function ClassNameTag(props: {
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
    <div ref={ref} className="text-xs p-0.5 font-mono tracking-tighter text-muted/25 z-50">
      {props.children}
    </div>
  )
}