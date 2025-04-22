import { CommentIcon, TrashIcon } from "@/app/icons";

export const description = "A button component that can be used as a child of other components. It supports different styles and sizes.";

export const Preview =
  <div className="flex flex-col gap-4 items-center">
    <div className="flex flex-wrap gap-3">
      <Button>Share</Button>
      <Button outline>Settings</Button>
      <Button primary>Log In</Button>
      <Button icon>
        <CommentIcon className="size-4.5" />
      </Button>
      <Button destructive>Delete</Button>
      <Button icon destructive>
        <TrashIcon className="size-4.5" />
      </Button>
    </div>
  </div>

export const Examples = [
  {
    name: "Disabled",
    description: "Disabled button states.",
    jsx: <PreviewDisabled />,
  },
  {
    name: "Loading",
    description: "Loading button states.",
    jsx: <PreviewLoading />,
  },
]







// <Source>
import { Slot } from "@radix-ui/react-slot";
import { cn } from "lazy-cn";
import type { ComponentProps } from "react";

export function Button({
  className,
  asChild,
  primary,
  outline,
  icon,
  destructive,
  disabled,
  ...props
}: ComponentProps<"button"> & {
  asChild?: boolean;
  primary?: boolean;
  outline?: boolean;
  destructive?: boolean;
  icon?: boolean;
  disabled?: boolean;
}) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp {...props} className={cn(
      "flex items-center box-border",
      "h-9 px-4",
      icon && "p-3",
      "rounded-md",
      "text-sm leading-none font-medium text-nowrap",
      "cursor-pointer select-none",
      "transition-[translate] active:translate-y-0.5",
      "hover:bg-foreground/5",
      "focus-visible:outline-4",
      "focus-visible:outline-focus",
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
    <div className="flex flex-wrap gap-3">
      <Button disabled>Share</Button>
      <Button outline disabled>Settings</Button>
      <Button primary disabled>Log In</Button>
      <Button icon disabled>
        <CommentIcon className="size-4.5" />
      </Button>
      <Button destructive disabled>Delete</Button>
      <Button icon destructive disabled>
        <TrashIcon className="size-4.5" />
      </Button>
    </div>
    // </Preview=Disabled>
  )
}

function PreviewLoading() {
  return ( // <Preview=Loading>
    <div className="flex flex-wrap gap-3">
      <Button disabled>Loading...</Button>
      <Button outline disabled>Loading...</Button>
      <Button primary disabled>Loading...</Button>
      <Button icon disabled>
        <CommentIcon className="size-4.5" />
      </Button>
      <Button destructive disabled>Loading...</Button>
      <Button icon destructive disabled>
        <TrashIcon className="size-4.5" />
      </Button>
    </div>
    // </Preview=Loading>
  )
}