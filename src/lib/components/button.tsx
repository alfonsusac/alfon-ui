import type { ComponentExamplesEntries } from "@/app/docs/components/[name]/page";
import { CommentIcon, LucideArrowLeft, LucideArrowRight, TrashIcon } from "@/app/icons";
import { ButtonFormExample } from "../examples/button-form";


export const description = "A button component that can be used as a child of other components. It supports different styles and sizes.";

export const Preview =
  <>
    <Button>Share</Button>
    <Button outline>Settings</Button>
    <Button primary>Log In</Button>
    <Button destructive>Delete</Button>
    <Button icon destructive>
      <TrashIcon />
    </Button>
    <Button icon>
      <CommentIcon />
    </Button>
  </>

export const Examples: ComponentExamplesEntries = [
  {
    name: "Variants",
    description: "Different button variants.",
    jsx: <div className="grid grid-cols-[repeat(4,max-content)] gap-2">
      {/* Preview=Variants */}
      <Button>Share</Button>
      <Button subtle>Settings</Button>
      <Button outline>Settings</Button>
      <Button primary>Log In</Button>
      <Button destructive>Share</Button>
      <Button destructive subtle>Settings</Button>
      <Button destructive outline>Settings</Button>
      <Button destructive primary>Log In</Button>
      {/* End Preview=Variants */}
    </div>
  },
  {
    name: "Disabled",
    description: "Disabled button states.",
    jsx: <PreviewDisabled />,
  },
  {
    name: "Icon",
    description: "Button with icons. Icons are mostly retrieved from icones.js.org",
    jsx: <PreviewIcon />
  },
  {
    name: "Sizes",
    description: "Button sizes.",
    jsx: <PreviewSizes />
  },
  {
    name: "Bare",
    description: "Button without padding.",
    jsx: <PreviewBare />,
  },

  // More Examples

  {
    name: "React 19 Form",
    description: "A button that works under React 19 <form>.",
    jsx: <ButtonFormExample />,
    external: "./src/lib/examples/button-form.tsx",
    advanced: true
  },
  {
    name: "Link Button",
    description: "A button that works as a link.",
    jsx: <PreviewLink />,
    advanced: true
  },
  {
    name: "Rounded",
    description: "A button with fully rounded corners.",
    jsx: <PreviewRounded />,
    advanced: true
  }


  // Inspirations




]







// <Source>
import { Slot } from "@radix-ui/react-slot";
import { cn } from "lazy-cn";
import type { ComponentProps, SVGProps } from "react";

export function Button({
  className,
  asChild,
  primary, outline, subtle, bare,
  destructive,
  icon,
  disabled,
  round,
  xs, sm, lg, xl,
  ...props
}: ComponentProps<"button"> & {
  asChild?: boolean,
  primary?: boolean, outline?: boolean, subtle?: boolean, bare?: boolean,
  destructive?: boolean,
  icon?: boolean,
  disabled?: boolean,
  xs?: boolean, sm?: boolean, lg?: boolean, xl?: boolean,
  round?: boolean,
}) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp {...props} className={cn(
      "flex items-center gap-2 box-border",
      "h-9 px-4",
      icon && "px-3",

      "rounded-md",
      "text-sm leading-none font-medium text-nowrap",
      "cursor-pointer select-none",
      "transition-[translate] active:translate-y-0.5",
      "hover:bg-foreground/5",
      "focus-visible:outline-4",
      "focus-visible:outline-focus",
      "[&_svg]:size-4 [&_svg]:shrink-0",
      round && "rounded-full",
      xs && ["h-7 text-xs px-2", icon && "w-7 p-0 justify-center"],
      sm && ["h-8 px-3", icon && "w-8 p-0 justify-center"],
      lg && ["h-10 [&_svg]:size-4.5", icon && "w-10 p-0 justify-center"],
      xl && ["h-11 text-base px-5 [&_svg]:size-5", icon && "w-11 p-0 justify-center"],
      primary && [
        "text-background",
        "bg-primary hover:bg-primary-hover",
        "shadow-sm"
      ],
      subtle && "bg-primary/5 hover:bg-primary/10",
      outline && "border border-border shadow-xs",
      bare && "p-0 hover:bg-transparent text-foreground/75 hover:text-foreground",
      destructive && [
        "text-destructive",
        "hover:bg-destructive/5",
        "focus-visible:outline-destructive-focus",
        primary && [
          "text-background",
          "bg-destructive hover:bg-destructive-hover",
        ],
        subtle && "bg-destructive/5 shadow-xs",
        outline && "border-destructive-border",
      ],
      disabled && [
        "cursor-not-allowed",
        "opacity-50",
        "pointer-events-none",
      ],
      className,
    )} />
  )
}
// </Source>





function PreviewDisabled() {
  return ( // <Preview=Disabled>
    <>
      <Button disabled>Share</Button>
      <Button outline disabled>Settings</Button>
      <Button primary disabled>
        <MingcuteLoading3Fill className="animate-spin" />
        Saving...
      </Button>
    </>
    // </Preview=Disabled>
  )
}

function PreviewIcon() {
  return ( // <Preview=Icon>
    <>
      <Button icon>
        <CommentIcon />
      </Button>
      <Button outline>
        <CommentIcon />
        Comment
      </Button>
      <Button primary>
        Next
        <LucideArrowRight />
      </Button>
    </>
    // </Preview=Icon>
  )
}

function PreviewSizes() {
  return ( // <Preview=Sizes>
    <div className="flex flex-row @xs/previewcard:flex-col gap-2">
      <div className="flex flex-col @xs/previewcard:flex-row gap-2 items-center">
        <Button primary xs>
          Send
        </Button>
        <Button primary sm>
          Send
        </Button>
        <Button primary>
          Send
        </Button>
        <Button primary lg>
          Send
        </Button>
        <Button primary xl>
          Send
        </Button>
      </div>
      <div className="flex flex-col @xs/previewcard:flex-row gap-2 items-center">
        <Button icon primary xs>
          <LucideArrowRight />
        </Button>
        <Button icon primary sm>
          <LucideArrowRight />
        </Button>
        <Button primary>
          Send
          <LucideArrowRight />
        </Button>
        <Button primary lg>
          Send
          <LucideArrowRight />
        </Button>
        <Button primary xl>
          Send
          <LucideArrowRight />
        </Button>
      </div>
    </div>
    // </Preview=Sizes>
  )
}

function PreviewBare() {
  return ( // <Preview=Bare>
    <div className="flex flex-col">
      <Button bare>
        <LucideArrowLeft />
        Back to Posts
      </Button>
      <Button bare>
        <LucideArrowLeft />
        Settings
      </Button>
    </div>
    // </Preview=Bare>
  )
}

function PreviewLink() {
  return ( // <Preview=Link Button>
    <Button asChild outline>
      <a href="https://www.v0.dev/" target="_blank">
        Open in
        <SimpleIconsV0 />
      </a>
    </Button>
    // </Preview=Link Button>
  )
}

function PreviewRounded() {
  return ( // <Preview=Rounded>
    <Button primary lg className="rounded-full px-5">
      <RiVercelFill />
      Start Deploying
    </Button>
    // </Preview=Rounded>
  )
}



export function MingcuteLoading3Fill(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from MingCute Icon by MingCute Design - https://github.com/Richard9394/MingCute/blob/main/LICENSE */}<g fill="none" fillRule="evenodd"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path><path fill="currentColor" d="M12 4.5a7.5 7.5 0 1 0 0 15a7.5 7.5 0 0 0 0-15M1.5 12C1.5 6.201 6.201 1.5 12 1.5S22.5 6.201 22.5 12S17.799 22.5 12 22.5S1.5 17.799 1.5 12" opacity=".1"></path><path fill="currentColor" d="M12 4.5a7.46 7.46 0 0 0-5.187 2.083a1.5 1.5 0 0 1-2.075-2.166A10.46 10.46 0 0 1 12 1.5a1.5 1.5 0 0 1 0 3"></path></g></svg>
  )
}
export function SimpleIconsV0(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Simple Icons by Simple Icons Collaborators - https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md */}<path fill="currentColor" d="M14.066 6.028v2.22h5.729q.075-.001.148.005l-5.853 5.752a2 2 0 0 1-.024-.309V8.247h-2.353v5.45c0 2.322 1.935 4.222 4.258 4.222h5.675v-2.22h-5.675q-.03 0-.059-.003l5.729-5.629q.006.082.006.166v5.465H24v-5.465a4.204 4.204 0 0 0-4.205-4.205zM0 8.245l8.28 9.266c.839.94 2.396.346 2.396-.914V8.245H8.19v5.44l-4.86-5.44Z"></path></svg>
  )
}
export function RiVercelFill(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Remix Icon by Remix Design - https://github.com/Remix-Design/RemixIcon/blob/master/License */}<path fill="currentColor" d="M23 21.648H1L12 2.352z"></path></svg>
  )
}