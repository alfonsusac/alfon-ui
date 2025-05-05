import type { CssVariableString } from "@/lib/css";
import type { AtCustomVariant } from "./parse-css";
import type { PreparsedGlobalCSS } from "./parse-globalcss";
import type { ResolvedVariableDeclarations } from "./resolve-var";

export type ResolvedCustomVariant = {
  [key: string]: {
    resolvedCssVarsUsed: string[]
  }
}
export function resolveCustomVariants2(
  variableDeclaration: Readonly<PreparsedGlobalCSS['atCustomVariants']>,
  resolvedCssVars: ResolvedVariableDeclarations,
) {
  const resolved: ResolvedCustomVariant = {}
  const variableDeclarationMap = new Map(Object.entries(variableDeclaration));
  variableDeclarationMap.forEach((value, key) => {
    resolved[key] = {
      resolvedCssVarsUsed: value.cssVarsUsed.flatMap(e => resolvedCssVars[e].resolvedCssVarsUsed)
    }
  })
  return resolved
}
