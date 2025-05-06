import type { DocsStructure, DocsStructureFile, DocsStructureFolder } from "@/lib/docs";
import { cn } from "lazy-cn";
import type { ComponentProps } from "react";
import Link from "next/link";
import { ExpandableFolder, SelectablePageItem } from "./sidebar.client";
import { CloseSidebarIcon, FluentTextAlignLeft16Filled, FolderClose, FolderOpen } from "../icons";
import { Button } from "@/lib/components/button";



export function Sidebar({
  className,
  docs,
  ...props
}: ComponentProps<"div"> & {
  docs: DocsStructure[]
  tools: string[]
}) {
  return (
    <div
      {...props}
      className={cn(
        "flex flex-col p-4 pt-4",
        "overflow-y-auto",
        "overflow-x-hidden",
        "leading-none",
        // "bg-current/3 leading-none",
        // "border-r border-current/10",
        "cursor-pointer",
        "z-20",
        className,
      )}
    >
      <div className="relative -mx-4 -mt-4 flex items-center">
        <Link href="/" className="block p-4 tracking-[-0.05em] font-mono font-medium text-current hover:bg-current/5 focus:outline-none">
          <span>alfon</span>
          <span className="text-current/50 mx-1">/</span>
          <span className="text-current">ui</span>
        </Link>
        <Button className="absolute right-1 px-1.5" icon>
          <CloseSidebarIcon className="size-5 fill-current/50" />
        </Button>
      </div>

      <div className="text-current/80 tracking-tight text-[0.95rem] font-mono pt-2">
        <SidebarItemPage data={{
          name: "index",
          type: "file",
          href: "/docs",
        }} />
        {docs.map(i => {
          if (i.type === "folder")
            return <SidebarItemFolder key={i.name} data={i} />
          return <SidebarItemPage key={i.name} data={i} />
        })}
        <SidebarItemFolder data={{
          name: "tools",
          type: "folder",
          children: props.tools.map(i => ({
            name: i,
            href: `/docs/tools/${ i }`,
            type: "file",
          }))
        }} />
      </div>
    </div>
  )
}


const sidebarItemClassName = cn(
  // "outline **:outline",
  "py-1 pl-4 -mx-4",

  "focus-visible:outline-3 ",
  "focus-visible:outline-current/10",
  "ring-offset-0",

  "flex items-center gap-3",
  "hover:bg-current/5",
  "select-none",

  "text-current/75",
  "hover:text-current",

  "aria-current-page:bg-current/5",
  "aria-current-page:text-current",
  "aria-current-page:font-medium",

  "svg:size-3.5",
  "svg:translate-y-[0.05rem]",
)

function SidebarItemPage(props: {
  data: DocsStructureFile
  indent?: number
}) {
  const { data } = props
  return <SelectablePageItem path={data.href}>
    <Link
      key={data.name}
      href={data.href}
      className={cn(sidebarItemClassName, 'group')}
    >
      <div className="-mr-3" style={{
        width: (props.indent ?? 0) * 16
      }} />
      <FluentTextAlignLeft16Filled fontSize={18} className="fill-current/50 shrink-0" />
      {data.name}
    </Link>
  </SelectablePageItem>
}

function SidebarItemFolder(props: {
  data: DocsStructureFolder
  indent?: number
}) {
  const { data } = props
  return (
    <ExpandableFolder
      key={data.name}
      target={
        <div className={cn(sidebarItemClassName, "group")}>
          <FolderClose fontSize={18} className="fill-current/50 group-data-opened:hidden block" />
          <FolderOpen fontSize={18} className="fill-current/50 group-data-opened:block hidden" />
          {data.name}
        </div>
      }
      content={
        <>
          {data.children?.map(i => {
            if (i.type === "folder")
              return <SidebarItemFolder key={i.name} data={i} indent={(props.indent ?? 0) + 1} />
            return <SidebarItemPage key={i.name} data={i} indent={(props.indent ?? 0) + 1} />
          })}
        </>
      }
    />

  )
}
