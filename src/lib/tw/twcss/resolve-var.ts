import type { PreparsedGlobalCSS } from "./parse-globalcss";

export type ResolvedVariableDeclarations = {
  [key: string]: {
    value: string,
    cssVarsUsed: string[],
    resolvedCssVarsUsed: string[]
  }
}

export function resolveVariableDeclarations(
  variableDeclaration: Readonly<PreparsedGlobalCSS['variableDeclarations']>
) {
  const resolved: ResolvedVariableDeclarations = {}

  const variableDeclarationMap = new Map(Object.entries(variableDeclaration));

  variableDeclarationMap.forEach((value, key) => {
    const cssVarsVisited = new Set<string>()
    cssVarsVisited.add(key)
    const stack = [...value.cssVarsUsed]
    while (stack.length) {
      const cssVar = stack.pop()!
      if (cssVarsVisited.has(cssVar)) continue
      cssVarsVisited.add(cssVar)

      const cssVarResolved = variableDeclaration[cssVar]
      if (cssVarResolved === undefined) continue
      stack.push(...cssVarResolved.cssVarsUsed)
    }
    resolved[key] = {
      value: value.value,
      cssVarsUsed: value.cssVarsUsed,
      resolvedCssVarsUsed: [...cssVarsVisited],
    }
  })

  return resolved
}
