



// export function resolveCssVarsDependencyList(cssDependencyList: ReturnType<typeof getGlobalCSSDependencyList>['variableDeclarations']) {

//   const variableDeclarations: Record<CssVariable, {
//     value: string,
//     cssVarsUsed: CssVariable[],
//     resolved?: {
//       cssVarsUsed: CssVariable[],
//     }
//   }> = cssDependencyList

//   Object.entries(variableDeclarations).forEach(([k, value]) => {
//     const key = k as CssVariable
//     const cssVarsUsed = new Set<CssVariable>()
//     const stack: CssVariable[] = [key as CssVariable]
//     while (stack.length > 0) {
//       const current = stack.pop()!
//       cssVarsUsed.add(current)
//       const declaration = variableDeclarations[current]
//       if (declaration) {
//         declaration.cssVarsUsed.forEach(v => {
//           !cssVarsUsed.has(v) && stack.push(v)
//         })
//       }
//     }
//     variableDeclarations[key].resolved = { cssVarsUsed: [...cssVarsUsed] }
//   })

//   return {
//     variableDeclarations,
//   }
// }

// export function resolveCustomVariantDependencyList(
//   customVariantDependencyList: ReturnType<typeof getGlobalCSSDependencyList>['atCustomVariants'],
//   resolvedCssVarsDependencyList: ReturnType<typeof resolveCssVarsDependencyList>['variableDeclarations'],
// ) {
//   const atCustomVariants: Record<CssVariable, {
//     cssVarsUsed: CssVariable[]
//     resolved?: { cssVarsUsed: CssVariable[] }
//   }> = customVariantDependencyList
//   Object.entries(customVariantDependencyList).forEach(
//     ([_key, value]) => {
//       const key = _key as CssVariable
//       const cssVarsUsed = new Set<CssVariable>()
//       value.cssVarsUsed.forEach(vars => {
//         resolvedCssVarsDependencyList[vars]
//           ?.resolved?.cssVarsUsed
//           .map(v => cssVarsUsed.add(v))
//       })
//       atCustomVariants[key].resolved = { cssVarsUsed: [...cssVarsUsed] }
//     }
//   )
//   return { atCustomVariants }
// }