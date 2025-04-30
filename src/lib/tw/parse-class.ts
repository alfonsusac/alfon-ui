import type { RoughlyParsedClassname } from "./parse-class-rough";
import type { Variant } from "./variants";

export type ParsedClassname = {
  variants: {
    full: string, // data-[] or aria-checked or nth-3 or not-in-data-asdf
    params: string, // [] or checked or 3 or in-data-asdf
  }[]
}

export function parseClassname(className: RoughlyParsedClassname) {

  const variants: Variant[] = []
  // const utility: 


  
}