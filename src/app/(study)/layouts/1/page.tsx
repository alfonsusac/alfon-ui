"use client"

import { Button } from "@/lib/components/button";
import { cn } from "lazy-cn";
import { useEffect, useRef, useState } from "react";
import { ClassNameTag, useHelperControls } from "../controls";

export default function LayoutStudy1() {

  const [sectionCount, setSectionCount] = useState(4)
  const sections = Array.from({ length: sectionCount }, (_, i) => ({
    ...sectionMockTitleAndDescriptions[i % sectionMockTitleAndDescriptions.length],
  }));

  const {
    Tooltip,
    rootRef,
  } = useHelperControls()

  return (
    <div
      ref={rootRef}
      className="p-(--control-p) transition-[padding]
                 leading-3
                 text-muted
                 text-sm
                 bg-zinc-900
                 bg-(--control-bg)
                 min-h-screen
                 flexcol-2/stretch
                 gap-(--control-gap)
                 "
      style={{
        "--page-width": "var(--container-5xl)",
        "--page-width-sm": "var(--container-4xl)",
        "--page-padding": "1rem",


        "--color-foreground": "rgba(159, 159, 159, 1)",
        "--color-primary": "rgba(159, 159, 159, 1)",
        "--color-background": "rgba(39, 39, 42, 1)",
      }}
    >
      {Tooltip}

      {/* Header */}
      <header className="bg-(--control-bg) sticky top-0 z-10 p-(--control-p) transition-[padding]">
        <ClassNameTag>header.sticky.top-0.z-10</ClassNameTag>
        <div className="max-w-(--page-width) mx-auto flexrow-space-between/center px-(--page-padding) h-14 bg-(--control-bg)">
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

      <main className="bg-(--control-bg) p-(--control-p) transition-[padding] space-y-(--control-gap)">
        <ClassNameTag>main</ClassNameTag>

        <section className="bg-(--control-bg) pb-40">
          <ClassNameTag>section</ClassNameTag>

          <div className="max-w-(--page-width-sm) mx-auto w-full bg-(--control-bg) flexcol-8 pt-20 pb-20 px-(--page-padding)">
            <ClassNameTag>div.max-w-(--page-width-sm).mx-auto.flex.flex-col.gap-8.py-20.px-(--page-padding)</ClassNameTag>

            <h1 className="text-6xl font-medium tracking-tighter max-w-4xl accent-amber-50 bg-(--control-bg)">
              Purpose is a linear-built tool for building and planning products
            </h1>

            <p className="text-xl font-medium tracking-tight max-w-lg text-current/75 bg-(--control-bg)">
              Meet the system for modern software development. Streamline issues, projects, and product roadmaps.
            </p>

            <div className="flexrow-4/center">
              <Button primary xl>Start Building</Button>
            </div>

          </div>
        </section>

        {sections.map((data, i) => {
          return (
            <section key={i} className={cn("bg-(--control-bg) bg-gradient-to-b from-transparent via-transparent to-white/5")}
            >
              <ClassNameTag>section</ClassNameTag>

              <div key={i} className={cn("max-w-(--page-width-sm) mx-auto bg-(--control-bg) py-24 px-(--page-padding) flexcol-16",)}>
                <ClassNameTag>div.max-w-(--page-width-sm) mx-auto flex flex-col gap-16 py-24 px-(--page-padding)</ClassNameTag>


                {/* Section Header */}
                <div className={cn("flex-wrap p-(--control-p) transition-[padding] bg-(--control-bg)",
                  data.layout === "col" ? "flexcol-4/stretch" : "flexcol-4/stretch sm:flexrow-8/center",
                )}>
                  <ClassNameTag>div.{data.layout === "col" ? "flex.flex-col.gap-4.items-stretch" : "flex-col.gap-4.items-stretch.sm:flex-row.sm:gap-8.sm:items-center"}</ClassNameTag>

                  <h2 className="text-6xl font-medium tracking-tighter max-w-2xl text-pretty min-w-0 flex-7 bg-(--control-bg)">
                    {data.title}
                  </h2>

                  <p className="text-base font-medium tracking-tight max-w-lg text-current/75 max-w-sm min-w-0 flex-3 bg-(--control-bg)">
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

      <footer className="bg-(--control-bg)">
        <ClassNameTag>footer</ClassNameTag>

        <div className="max-w-(--page-width) mx-auto flexrow min-h-80 bg-(--control-bg) px-(--page-padding) py-16">
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
