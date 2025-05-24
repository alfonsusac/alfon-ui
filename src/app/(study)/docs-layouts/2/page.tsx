import { type ComponentProps } from "react"
import { Content, CuidaSidebarExpandOutline, sidebarMockPages } from "../commons"
import { Button } from "@/lib/components/button"
import { MaterialSymbolsDarkMode, MaterialSymbolsLightMode, PajamasGithub, PhCaretRightBold, PhListBold, PhMagnifyingGlassBold } from "../../layouts/commons"
import { cn } from "lazy-cn"
import { DesignDevtool } from "./design-tooltip"

export default function DocsLayout2() {

  return (
    <div className="min-h-screen
                    [--page-px:1.5rem]
                    max-md:[--header-h:calc(var(--spacing)*24)]
                    [--sidebar-w:calc(var(--spacing)*64)]
                    [--content-w:var(--container-xl)]
                    [--toc-w:calc(var(--spacing)*56)]
                    overflow-x-clip
                    
                    bg-background
                    text-foreground

                    [--color-background:var(--color-neutral-950)]
                    [--color-foreground:#fff]
                    [--color-primary:var(--color-blue-500)]
    ">
      <DesignDevtool />
      <MobileHeader className="z-20 h-(--header-h) fixed w-[100vw] top-0 min-md:hidden" />

      {/* Desktop Sidebar */}
      <DesktopSidebar className="fixed top-0 h-[100vh] w-(--sidebar-w) max-md:hidden border-r border-muted/25" />

      {/* Main Content */}
      <div className="w-full  pt-(--header-h) flexrow-space-between">

        <div className="w-(--sidebar-w) shrink-0 max-md:hidden" />
        <main className="py-20 px-(--page-px) max-w-(--content-w) mx-auto">
          <Content>
            <h1>Welcome to Purpose</h1>
          </Content>
        </main>
        <div className="w-(--toc-w) shrink-0 max-md:hidden" />

      </div>

      {/* Table of Content */}
      <nav className="fixed top-0 h-[100vh] right-0 w-(--toc-w) max-mx:hidden bg-background">
        <div className="flexcol-3">
          <div className="font-semibold text-base pt-20">
            Quick Nav
          </div>
          <div className="flexcol-2 text-muted text-sm">
            <div>Vision</div>
            <div>Key Features</div>
            <div className="text-primary font-medium">Acessible</div>
            <div>Unstyled</div>
            <div>Compatible</div>
          </div>
        </div>
      </nav>


    </div>
  )
}

function MockLogo({ className, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} className={cn("flexrow-2/center text-xl", className)}>
      <div className="size-[1.3em] rounded-full bg-linear-to-tl from-primary/15 via-40% via-primary/15 to-primary" />
      <span className="font-semibold tracking-tighter">Purpose</span>
    </div>
  )
}
function Breadcrumb() {
  return (
    <div className="flexrow-2/center text-sm">
      <span className="text-muted">Docs</span>
      <PhCaretRightBold className="size-3" />
      <span className="text-foreground/75 font-medium">Getting Started</span>
    </div>
  )
}
function MobileHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header className={cn("flexcol-2/stretch justify-center border-b border-b-muted/25 px-6 bg-background ",
      ""
      , className)}
      {...props}>
      <div className="flexrow-space-between/center">
        <MockLogo />

        <div className="flexrow-2/center">
          <Button icon><PhMagnifyingGlassBold /></Button>
          <Button icon><PhListBold /></Button>
          <Button primary sm className="text-foreground">Dashboard <PhCaretRightBold className="size-3!" /></Button>
        </div>
      </div>
      <div className="flexrow-0/center">
        <Breadcrumb />
      </div>
    </header>
  )
}
function SidebarItemList() {
  return <>
    {
      sidebarMockPages.map((group, i) => {
        return (
          <div key={i}>
            <div className="text-sm text-muted/75 font-medium shrink-0 pb-2">
              {group.groupname}
            </div>
            {
              group.items.map((item, j) => {
                if (i === 0 && j === 1) {
                  return (
                    <div key={j} className="p-1.5 px-3 -mx-3 rounded-md bg-primary/25 text-sm text-primary font-medium">
                      {item}
                    </div>
                  )
                }
                return (
                  <div key={j} className="p-1.5 px-3 -mx-3 rounded-md hover:bg-white/5 text-sm">
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
function ThemeSwitcher() {
  return (
    <div className="flexrow-0/center *:rounded-full rounded-full border border-muted/15">
      <Button icon xs>
        <MaterialSymbolsLightMode />
      </Button>
      <Button icon xs className="bg-primary/25 text-primary">
        <MaterialSymbolsDarkMode />
      </Button>
    </div>
  )
}
function SearchBar() {
  return (
    <div className="flexrow-2/center text-foreground/75 text-sm p-2 bg-muted/15 rounded-md leading-3">
      <PhMagnifyingGlassBold className="size-4 text-muted" /> Search
    </div>
  )
}
function DesktopSidebar({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav {...props} className={cn("bg-background  flexcol-0/stretch", className)}>
      {/* Top: Sticky */}
      <div className="p-3 pt-4 pb-0 flexcol-2/stretch">
        <div className="flexrow-space-between/center">
          <div className="p-2">
            <MockLogo className="text-base" />
          </div>
          <Button icon sm>
            <CuidaSidebarExpandOutline />
          </Button>
        </div>
        <SearchBar />
      </div>

      {/* Middle */}
      <div className="grow min-h-0 relative flexcol">
        <div className="absolute top-0 h-4 w-full bg-gradient-to-t from-transparent to-background" />
        <div className="p-3 pt-4 overflow-auto">
          <div className="px-3 flexcol-4/stretch">
            <SidebarItemList />
          </div>
        </div>
        <div className="absolute bottom-0 h-4 w-full bg-gradient-to-b from-transparent to-background" />
      </div>

      {/* Bottom: Sticky */}
      <div className="p-3 flexrow-space-between/center">
        <div>
          <Button icon sm>
            <PajamasGithub />
          </Button>
        </div>
        <ThemeSwitcher />
      </div>
    </nav>
  )
}