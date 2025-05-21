import { Button } from "@/lib/components/button";
import { MockLogo } from "../../layouts/logo";
import { Content, CuidaSidebarExpandOutline, Header, NavbarCenter, NavbarEnd, Sidebar, SidebarItemList, sidebarMockPages } from "../commons";

export default function DocsLayout1() {
  return (
    <div className="min-h-screen
      [--page-px:1.5rem]
      [--header-h:calc(var(--spacing)*16)]
      [--sidebar-w:calc(var(--spacing)*60)]
      [--content-w:var(--container-xl)]
      [--toc-w:calc(var(--spacing)*56)]
      overflow-x-clip

      bg-background
      text-foreground
    "
      style={{
        "--color-background": "var(--color-neutral-950)",
        "--color-foreground": "#fff",
        "--color-primary": "var(--color-blue-500)",
        "--color-muted": "color-mix(in srgb, color-mix(in srgb, var(--color-foreground) 75%, var(--color-primary)), var(--color-background) 25%)",
      }}
    >
      <Header className="fixed h-(--header-h) w-[100vw] top-0 z-20 px-(--page-px)">
        <div className="navbar-start flexrow-4/center">
          <MockLogo />
          <Button icon className="size-8 p-2 block">
            <CuidaSidebarExpandOutline />
          </Button>
        </div>
        <NavbarCenter />
        <NavbarEnd /> 
      </Header>

      <Sidebar className="w-(--sidebar-w) fixed top-(--header-h) bottom-0 bg-background
                          max-lg:hidden">
        <SidebarItemList />
      </Sidebar>

      <div className="w-[100vw] flexrow-center mt-(--header-h)">
        <SidebarGutter />
        <main className="max-w-(--content-w) py-16 px-(--page-px)">
          <div className="text-primary font-semibold">Getting Started</div>
          <Content>
            <h1>Welcome to Purpose</h1>
          </Content>
        </main>
        <TableOfContentGutter />
      </div>

      <nav className="w-(--toc-w) right-0 fixed top-(--header-h) 
                      max-md:hidden
                      flexcol-4 bg-background p-4 py-16">
        <div className="font-semibold text-base">
          Quick Nav
        </div>
        <div className="flexcol-2 text-muted text-sm">
          <div>Vision</div>
          <div>Key Features</div>
          <div className="text-primary font-medium">Acessible</div>
          <div>Unstyled</div>
          <div>Compatible</div>
        </div>
      </nav>

    </div>
  )
}

export const SidebarGutter = () => <div className="flex-none w-(--sidebar-w) max-lg:hidden" />
export const TableOfContentGutter = () => <div className="flex-none w-(--toc-w) max-md:hidden" />