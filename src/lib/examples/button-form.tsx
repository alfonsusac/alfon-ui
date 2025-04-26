"use client"

import type { ComponentProps, SVGProps } from "react"

export const description = "A button that works under React19 <form> with icons."

export function ButtonFormWithIconExample() {
  return (
    <form action={async () => {
      // wait for 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return
    }}>
      <SubmitButtonWithIcon>
        <LucideSave />
        Submit
      </SubmitButtonWithIcon>
    </form>
  )
}

// <Source>
import { Button } from "../components/button"
import { useFormStatus } from "react-dom"
import { cn } from "lazy-cn"

export function SubmitButtonWithIcon({ className, ...props }:
  ComponentProps<typeof Button>
) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      primary
      className={cn(
        "[:where(&:disabled>svg:nth-child(2))]:hidden",
        className
      )}
      {...props}
    >
      {pending && <MingcuteLoading3Fill className="animate-spin" />}
      {props.children}
    </Button>
  )
}

export function MingcuteLoading3Fill(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from MingCute Icon by MingCute Design - https://github.com/Richard9394/MingCute/blob/main/LICENSE */}<g fill="none" fillRule="evenodd"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path><path fill="currentColor" d="M12 4.5a7.5 7.5 0 1 0 0 15a7.5 7.5 0 0 0 0-15M1.5 12C1.5 6.201 6.201 1.5 12 1.5S22.5 6.201 22.5 12S17.799 22.5 12 22.5S1.5 17.799 1.5 12" opacity=".1"></path><path fill="currentColor" d="M12 4.5a7.46 7.46 0 0 0-5.187 2.083a1.5 1.5 0 0 1-2.075-2.166A10.46 10.46 0 0 1 12 1.5a1.5 1.5 0 0 1 0 3"></path></g></svg>
  )
}
// </Source>


export function LucideSave(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Lucide by Lucide Contributors - https://github.com/lucide-icons/lucide/blob/main/LICENSE */}<g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7M7 3v4a1 1 0 0 0 1 1h7"></path></g></svg>
  )
}