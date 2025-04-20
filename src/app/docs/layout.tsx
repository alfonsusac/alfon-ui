import { cn } from "lazy-cn";
import { getAppDocsStructure } from "../docs";
import { Sidebar } from "./sidebar";


const sidebarClassName = "hidden md:flex  w-56 shrink-0"
const secondarySidebarClassName = "hidden lg:flex w-52 shrink-0"

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

        {/* Sidebar */}
        <Sidebar
          docs={docs}
          className={cn(
            sidebarClassName,
            "h-screen fixed top-0",
          )} />

        <div className="mx-auto flex w-full">
          <div className={cn(sidebarClassName, "")} />

          <div className="px-8 sm:px-16 grow">
            <div className={cn(
              "max-w-(--content-width) mx-auto w-full py-20 article"
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
