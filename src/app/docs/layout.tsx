import { cn } from "lazy-cn";
import { getAppDocsStructure } from "../docs";
import { Sidebar } from "./sidebar";
import { Button } from "@/lib/components/button";
import { CommentIcon } from "../icons";


const sidebarClassName = "hidden md:flex  w-56 shrink-0"
const secondarySidebarClassName = "hidden lg:flex w-52 shrink-0"
const topbarClassName = "h-16"

export default async function DocsRootLayout(props: {
  children: React.ReactNode;
}) {
  const docs = await getAppDocsStructure()
  return (
    <div className="min-h-screen"
      style={{
        "--page-width": "var(--container-6xl)",
        "--content-width": "var(--container-xl)",
        "--page-padding": "2rem",
      }}
    >
      <div className="flex w-full">

        {/* Top Bar */}
        <div className={cn("h-12 flex fixed w-screen left-1/2 -translate-x-1/2 flex z-10")}>
          <div className={cn(sidebarClassName)} />
          <div className="flex items-center border-b border-transparent p-2 grow">
            <div className="grow"></div>
            <div className="flex gap-1 items-center">
              <Button>
                Share
              </Button>
              <Button>
                <CommentIcon className="size-4.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar docs={docs} className={cn(sidebarClassName, "h-screen fixed top-0")} />

        <div className="mx-auto flex w-full">
          <div className={cn(sidebarClassName, "")} />
          <div className="px-8 sm:px-16 grow min-w-0">
            <div className={cn(topbarClassName)} />
            <div className={cn(
              "max-w-(--content-width) mx-auto w-full py-10 article",
              "@container/main",
            )}>
              {props.children}
            </div>
          </div>
          <div className={cn(secondarySidebarClassName, "")} />
        </div>

        {/* TOC */}
        <div className={cn(secondarySidebarClassName, "flex-col h-screen overflow-auto fixed top-0 right-0 p-2 leading-none")}>
          {/* <LongText /> */}
        </div>
      </div>
    </div>
  )
}
