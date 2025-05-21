"use client"

import { Button } from "@/lib/components/button";
import { MockLogo } from "../logo";
import { useEffect, useState } from "react";
import { useHelperControls } from "../controls";
import { Content, CuidaSidebarExpandOutline, sidebarMockPages } from "../../docs-layouts/commons";

export default function LayoutStudy5() {

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

  const [prioritizeTOC, setPrioritizeTOC] = useState(false)

  return (
    <div className="min-h-screen
                    [--page-px:1.5rem]
                    [--header-h:calc(var(--spacing)*16)]
                    [--sidebar-w:calc(var(--spacing)*60)]
                    [--content-w:var(--container-xl)]
                    [--toc-w:calc(var(--spacing)*56))]
                    overflow-x-clip
    " ref={rootRef}>
      {Tooltip}
      <header className="navbar
                        fixed h-(--header-h) w-[100vw] top-0 z-20
                        px-(--page-px)
                        bg-zinc-900
                        flexrow-space-between/center
      ">
        <div className="navbar-start flexrow-4/center">
          <MockLogo />
          <Button icon className="size-8 p-2 block">
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

      <nav className="w-(--sidebar-w)  fixed top-(--header-h) bottom-0 bg-zinc-900
                      px-(--page-px) 
                      overflow-y-auto pb-4 z-20
                      flexcol-4/stretch
                      data-[prioritisetoc=true]:max-lg:hidden
                      data-[prioritisetoc=false]:max-md:hidden
      " data-prioritisetoc={prioritizeTOC}>
        {sidebarMockPages.map((group, i) => {
          return (
            <div key={i}>
              <div className="text-sm text-muted/50 font-medium shrink-0">
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

      <div className="w-[100vw] left-0 relative mt-(--header-h) flexrow">

        {/* Content Left Padding */}
        <div className="flex-none w-(--sidebar-w)
                        data-[prioritisetoc=true]:max-lg:hidden
                        data-[prioritisetoc=false]:max-md:hidden
        " data-prioritisetoc={prioritizeTOC}></div>

        <div className="max-w-(--content-w) mx-auto p-8 flex-initial">
          <Content>
            <h1>Another Docs Layout</h1>
            <div className="flexcol-0">
              <Button primary onClick={() => setIsOPressed(prev => !prev)}>
                Toggle Root Overflow
              </Button>
              <p>Press O to toggle on/off body's overflow. </p>
              <Button primary onClick={() => setPrioritizeTOC(prev => !prev)}>
                {prioritizeTOC ? "Prioritize Sidebar" : "Prioritize TOC"}
              </Button>
            </div>
          </Content>
        </div>

        {/* Content Right Padding */}
        <div className="flex-none w-(--toc-w)
                        data-[prioritisetoc=true]:max-md:hidden
                        data-[prioritisetoc=false]:max-lg:hidden
                        " data-prioritisetoc={prioritizeTOC}></div>

      </div>

      <div className="content-nav
                      fixed top-(--header-h) bottom-0 right-0
                      w-(--toc-w)
                      data-[prioritisetoc=true]:max-md:hidden
                      data-[prioritisetoc=false]:max-lg:hidden
                      self-stretch
      " data-prioritisetoc={prioritizeTOC}>
        <div className="sticky top-(--header-h) p-4 pt-16 flexcol-4">
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





