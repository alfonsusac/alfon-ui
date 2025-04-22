import type { ComponentExamplesEntries } from "@/app/docs/components/[name]/page";
import { CommentIcon, LucideArrowRight, NextStepIcon, TrashIcon } from "@/app/icons";

export const description = "A button component that can be used as a child of other components. It supports different styles and sizes.";

export const Preview =
  <>
    <Button>Share</Button>
    <Button outline>Settings</Button>
    <Button primary>Log In</Button>
    <Button icon>
      <CommentIcon />
    </Button>
    <Button destructive>Delete</Button>
    <Button icon destructive>
      <TrashIcon />
    </Button>
  </>

export const Examples: ComponentExamplesEntries = [
  {
    name: "Disabled",
    description: "Disabled button states.",
    jsx: <PreviewDisabled />,
  },
  {
    name: "Icon",
    description: "Button with icons. Icons are mostly retrieved from icons.js.org",
    jsx: <PreviewIcon />
  },
  {
    name: "Loading",
    description: "Loading button states.",
    jsx: <PreviewLoading />,
  },
  {
    name: "Sizes",
    description: "Button sizes.",
    jsx: <PreviewSizes />
  },

  // More Examples

  {
    name: "React 19 Form",
    description: "A button that works under React 19 <form>.",
    jsx: <ButtonFormExample />,
    external: "./src/lib/examples/button-form.tsx",
    advanced: true
  }



  // Inspirations




]







// <Source>
import { Slot } from "@radix-ui/react-slot";
import { cn } from "lazy-cn";
import type { ComponentProps, SVGProps } from "react";
import { ButtonFormExample } from "../examples/button-form";

export function Button({
  className,
  asChild,
  primary, outline,
  destructive,
  icon,
  disabled,
  xs, sm, lg, xl,
  ...props
}: ComponentProps<"button"> & {
  asChild?: boolean;
  primary?: boolean; outline?: boolean;
  destructive?: boolean;
  icon?: boolean;
  disabled?: boolean;
  xs?: boolean; sm?: boolean; lg?: boolean; xl?: boolean;
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
      xs && ["h-6 text-xs px-3", icon && "px-1"],
      sm && ["h-7.5", icon && "px-2"],
      lg && ["h-10 [&_svg]:size-4.5", icon && "px-3"],
      xl && ["h-11 text-base px-5 [&_svg]:size-5", icon && "px-4"],
      primary && [
        "text-background",
        "bg-primary hover:bg-primary-hover",
        "shadow-sm"
      ],
      outline && [
        "border border-border",
      ],
      destructive && [
        "text-destructive",
        "hover:bg-destructive/10",
        "focus-visible:outline-destructive-focus",
        primary && [
          "text-background",
          "bg-destructive hover:bg-destructive-hover",
        ],
        outline && [
          "border-destructive-border",
        ]
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
      <Button primary disabled>Log In</Button>
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
        <NextStepIcon />
      </Button>
    </>
    // </Preview=Icon>
  )
}

function PreviewLoading() {
  return ( // <Preview=Loading>
    <>
      <Button disabled>
        <MingcuteLoading3Fill className="animate-spin" />
        Sending...
      </Button>
      <Button outline disabled>
        <MingcuteLoading3Fill className="animate-spin" />
        Loading...
      </Button>
      <Button primary disabled>
        <MingcuteLoading3Fill className="animate-spin" />
        Saving...
      </Button>
    </>
    // </Preview=Loading>
  )
}


function PreviewSizes() {
  return ( // <Preview=Sizes>
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
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
      <div className="flex gap-2 items-center">
        <Button icon primary xs>
          <NextStepIcon />
        </Button>
        <Button icon primary sm>
          <NextStepIcon />
        </Button>
        <Button icon primary>
          Send
          <NextStepIcon />
        </Button>
        <Button icon primary lg>
          Send
          <NextStepIcon />
        </Button>
        <Button icon primary xl>
          Send
          <NextStepIcon />
        </Button>
      </div>
    </div>
    // </Preview=Sizes>
  )
}



export function MingcuteLoading3Fill(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from MingCute Icon by MingCute Design - https://github.com/Richard9394/MingCute/blob/main/LICENSE */}<g fill="none" fillRule="evenodd"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path><path fill="currentColor" d="M12 4.5a7.5 7.5 0 1 0 0 15a7.5 7.5 0 0 0 0-15M1.5 12C1.5 6.201 6.201 1.5 12 1.5S22.5 6.201 22.5 12S17.799 22.5 12 22.5S1.5 17.799 1.5 12" opacity=".1"></path><path fill="currentColor" d="M12 4.5a7.46 7.46 0 0 0-5.187 2.083a1.5 1.5 0 0 1-2.075-2.166A10.46 10.46 0 0 1 12 1.5a1.5 1.5 0 0 1 0 3"></path></g></svg>
  )
}
