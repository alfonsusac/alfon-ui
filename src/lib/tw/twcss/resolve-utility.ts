import type { PreparsedGlobalCSS } from "./parse-globalcss"
import type { ResolvedCustomVariant } from "./resolve-custom-var"

// TODO! Do this first!
export type MappedUtilities = {
  [key: string]: {
    customVariantsUsed: string[],
    modifierTypes: `--${ string }-*`[],
    valueTypes: `--${ string }-*`[],
  }
}

export type ResolvedUtilities = {
  [key: string]: {
    cssVarsUsed: string[],
    customVariantsUsed: string[],
    valueTypes: `--${ string }-*`[],
    modifierTypes: `--${ string }-*`[],
  }
}