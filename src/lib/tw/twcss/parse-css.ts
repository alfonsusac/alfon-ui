import {
  isCssVariable,
  isTwTypePattern,
  type CssVariableString,
} from "@/lib/css"
import postcss, { type AtRule } from "postcss"
import valueParser, { type Node } from "postcss-value-parser"
import { roughParseClassname } from "../parse-class-rough"
import { createVariantTree, walkVariants } from "../variants"
import { parseUtility } from "../utilities"
import { analyzeArbitrary } from "../arbitrary"
import type { Modifier } from "../modifier"

export type VariableDeclaration = {
  name: CssVariableString
  value: string
  cssVarsUsed: readonly CssVariableString[]
}
export type AtCustomVariant = {
  name: string
  cssVarsUsed: readonly CssVariableString[]
}
export type AtUtility = {
  classNamesUsed: readonly string[]
  cssVarsUsed: readonly CssVariableString[]
  variantsUsed: readonly string[]
} & ({
  name: string,
  type: "static"
} | {
  name: `${ string }-*`
  type: "dynamic"
  themedValueTypes: readonly `--${ string }-*`[]
  themedModifierTypes: readonly `--${ string }-*`[]
})



export type ParsedTailwindCSS = {
  variableDeclarations: Record<CssVariableString, VariableDeclaration>
  atUtilities: Record<string, AtUtility>
  atCustomVariants: Record<string, AtCustomVariant>
}



export function parseTailwindCSS(css: string) {
  const parsedCss = postcss.parse(css)

  // 1 - parse all @theme, @utility, @custom-variant
  const variables = new Map<CssVariableString, VariableDeclaration>()
  const atUtilities = new Map<string, AtUtility>()
  const atCustomVariants = new Map<string, AtCustomVariant>()
  parsedCss.walk((n) => {
    n.type === "atrule" && n.name === "theme" && processAtThemes(n, variables)
    n.type === "atrule" && n.name === "custom-variant" && processAtCustomVariants(n, atCustomVariants)
    n.type === "atrule" && n.name === "utility" && processAtUtilities(n, atUtilities)
  })

  type Resolved<T extends object> = T & { allCssVarsUsed: readonly CssVariableString[] }
  const resolvedVariables = new Map<string, Resolved<VariableDeclaration>>()
  const resolvedAtCustomVariants = new Map<string, Resolved<AtCustomVariant>>()
  const resolvedAtUtilities = new Map<string, Resolved<AtUtility> & {
    themedValueParams: Record<string, { resolvedVariableDeclarations: Resolved<VariableDeclaration>[] }>
    themedModifierParams: Record<string, { resolvedVariableDeclarations: Resolved<VariableDeclaration>[] }>
    atUtilitiesUsed: { utility: string; params?: string; modifier?: Modifier }[]
  }>()

  // const getAllCssVarsUsed = (node: { allCssVarsUsed: readonly CssVariableString[] }, forEach: () => ) => { }

  // 2 - resolve all css variables used in each variable
  // resolve css variabls
  variables.forEach((val, key) => {
    const cssVarUsed = new Set<CssVariableString>()
    const stack = [...val.cssVarsUsed]
    while (stack.length) {
      const cssVar = stack.pop()!
      cssVarUsed.add(cssVar)
      variables.get(cssVar)?.cssVarsUsed.forEach(v => cssVarUsed.has(v) && stack.push(v))
    }
    resolvedVariables.set(key, { ...val, allCssVarsUsed: [...cssVarUsed] })
  })

  // resolve custom variants
  atCustomVariants.forEach((val, key) => {
    const cssVarUsed = new Set<CssVariableString>()
    val.cssVarsUsed.forEach((v) => {
      if (cssVarUsed.has(v)) return
      cssVarUsed.add(v)
      resolvedVariables.get(v)?.allCssVarsUsed.forEach((v) => cssVarUsed.add(v))
    })
    resolvedAtCustomVariants.set(key, { ...val, allCssVarsUsed: [...cssVarUsed], })
  })

  // resolve utilities / construct utility dependency graph
  atUtilities.forEach((val, key) => {
    const cssVarUsed = new Set<CssVariableString>()
    const themedValueParams = new Map<string, { resolvedVariableDeclarations: Resolved<VariableDeclaration>[] }>() // themedValueParams["red-500"] = ... Resolved VariableDeclaration [] ...
    const themedModifierParams = new Map<string, { resolvedVariableDeclarations: Resolved<VariableDeclaration>[] }>() // themedModifierParams["red-500"] = ... Resolved VariableDeclaration [] ...
    const atUtilitiesUsed: { utility: string; param?: string; modifier?: Modifier }[] = []

    // resolve css variables used
    val.cssVarsUsed.forEach(v => {
      if (cssVarUsed.has(v)) return
      cssVarUsed.add(v)
      resolvedVariables.get(v)?.allCssVarsUsed.forEach((v) => cssVarUsed.add(v))
    })

    // resolve variants used
    val.variantsUsed.forEach(v => {
      resolvedAtCustomVariants.get(v)?.allCssVarsUsed.forEach(v => {
        if (cssVarUsed.has(v)) return
        cssVarUsed.add(v)
        resolvedVariables.get(v)?.allCssVarsUsed.forEach(w => cssVarUsed.add(w))
      })
    })

    if (val.type === "dynamic") {
      // resolve themed value types
      val.themedValueTypes.forEach(t => {
        const resolvedVariableDeclarations = new Set<Resolved<VariableDeclaration>>()
        const typeName = t.split("-*")[0]
        resolvedVariables.forEach(cssvar => { cssvar.name.startsWith(typeName) && resolvedVariableDeclarations.add(cssvar) })
        themedValueParams.set(t, { resolvedVariableDeclarations: [...resolvedVariableDeclarations] })
      })
      // resolve themed modifier types
      val.themedModifierTypes.forEach((t) => {
        const resolvedVariableDeclarations = new Set<Resolved<VariableDeclaration>>()
        const typeName = t.split("-*")[0]
        resolvedVariables.forEach(cssvar => { cssvar.name.startsWith(typeName) && resolvedVariableDeclarations.add(cssvar) })
        themedModifierParams.set(t, { resolvedVariableDeclarations: [...resolvedVariableDeclarations] })
      })
    }

    val.classNamesUsed.forEach((cn) => {
      // Parse variants
      const parsed = roughParseClassname(cn)
      parsed.variants.forEach((variantStr) => {
        walkVariants(createVariantTree(variantStr), (variant) => {
          if (variant.type !== "custom variant") return
          resolvedAtCustomVariants.get(variant.prefix)?.allCssVarsUsed.forEach((v) => cssVarUsed.add(v))
        })
      })

      // Parse utility
      const utility = parseUtility(parsed.utility + (parsed.modifier ? `/${ parsed.modifier }` : ""),)
      // if (key === 'asdf-*') console.log("Hello?", utility)
      
      utility.modifier

      if (utility.type === "default defined param utility") {
        // get this utility's value type.
        // match against the registered value type's values
        utility.valueTypes.forEach(v => { resolvedVariables.get(v.split("*")[0] + utility.param)?.allCssVarsUsed.forEach(v => cssVarUsed.add(v)) })
        // modifier?
      } else if (utility.type === "default arbitrary utility") {
        const arb = analyzeArbitrary(utility.param)
        arb.cssVarUsed.forEach(v => { resolvedVariables.get(v)?.allCssVarsUsed.forEach(v => cssVarUsed.add(v)) })
        // modifier?
      } else if (utility.type === "full arbitrary utility") {
        const arb = analyzeArbitrary(utility.full)
        arb.cssVarUsed.forEach(v => { resolvedVariables.get(v)?.allCssVarsUsed.forEach(v => cssVarUsed.add(v)) })
        // modifier?
      } else if (utility.type === "custom utility") {
        // find first the name of the utility.
        [...atUtilities.keys()]
          .filter((key) => utility.full.startsWith(key))
          .forEach((key) => {
            const { prefix, param, modifier } = utility.resolve(key)
            atUtilitiesUsed.push({ utility: prefix, modifier, param })
          })
      }
    })

    resolvedAtUtilities.set(key, {
      ...val,
      allCssVarsUsed: [...cssVarUsed],
      themedValueParams: Object.fromEntries(themedValueParams),
      themedModifierParams: Object.fromEntries(themedModifierParams),
      atUtilitiesUsed: atUtilitiesUsed,
    })
  })

  return {
    variableDeclarations: Object.fromEntries(resolvedVariables),
    atCustomVariants: Object.fromEntries(resolvedAtCustomVariants),
    atUtilities: Object.fromEntries(resolvedAtUtilities),
  }
}

// → #1 | Process @theme
//        - reads css variables and their values
function processAtThemes(n: AtRule, variables: Map<string, VariableDeclaration>) {
  n.walkDecls((d) => {
    if (!d.variable || !isCssVariable(d.prop)) return
    const cssVarsUsed = new Set<CssVariableString>()
    valueParser(d.value).walk((n) => { extractVarUsed(n, cssVarsUsed) })
    variables.set(d.prop, {
      name: d.prop,
      value: d.value,
      cssVarsUsed: [...cssVarsUsed],
    })
  })
}

// → #1 | Process @custom-variant [name] (value)
//        - reads direct css variables used
function processAtCustomVariants(n: AtRule, customVariants: Map<string, AtCustomVariant>,) {
  const cssVarsUsed = new Set<CssVariableString>()
  const name = n.params.split(" ")[0]
  n.walkDecls((d) => { valueParser(d.value).walk((v) => { extractVarUsed(v, cssVarsUsed) }) })
  customVariants.set(name, { name, cssVarsUsed: [...cssVarsUsed] })
}

// → #1 | Process @utility [name]
//        - extracts css variables used
//        - extracts class names used
//        - extracts modifier types
//        - extracts value types
function processAtUtilities(n: AtRule, utilities: Map<string, AtUtility>) {

  const type = n.params.endsWith("-*") ? "dynamic" : "static"
  const name = n.params

  const cssVarsUsed = new Set<CssVariableString>()
  const variantsUsed = new Set<string>()
  const classNamesUsed = new Set<string>()

  const modifierTypes = new Set<`--${ string }-*`>()
  const valueTypes = new Set<`--${ string }-*`>()

  n.walk((d) => {
    if (d.type === "decl")
      valueParser(d.value).walk((n) => {
        extractVarUsed(n, cssVarsUsed)
        n.value === "--value" && extractThemedTokenTypes(n, valueTypes)
        n.value === "--modifier" && extractThemedTokenTypes(n, modifierTypes)
      })
    if (d.type === "atrule" && d.name === "apply")
      d.params.split(/\s+/).forEach((c) => classNamesUsed.add(c))
    if (d.type === "atrule" && d.name === "variant") variantsUsed.add(d.params)
  })

  if (type === "dynamic") {
    utilities.set(name, {
      name: name as `${ string }-*`,
      type,
      classNamesUsed: [...classNamesUsed],
      themedValueTypes: [...valueTypes],
      themedModifierTypes: [...modifierTypes],
      cssVarsUsed: [...cssVarsUsed],
      variantsUsed: [...variantsUsed],
    })
    return
  }

  utilities.set(name, {
    name, type,
    classNamesUsed: [...classNamesUsed],
    cssVarsUsed: [...cssVarsUsed],
    variantsUsed: [...variantsUsed],
  })
}

// Utility

function extractThemedTokenTypes(
  n: Node,
  themedTokenTypes: Set<`--${ string }-*`>,
) {
  if (n.type !== "function") return
  n.nodes
    .filter((a) => a.type === "word")
    .flatMap((a) => (isTwTypePattern(a.value) ? [a.value] : []))
    .forEach((a) => { themedTokenTypes.add(a) })
}

function extractVarUsed(n: Node, cssVarsUsed: Set<CssVariableString>) {
  if (n.type !== "function" || n.value !== "var" || n.nodes[0].type !== "word")
    return
  const argument = n.nodes[0]
  isCssVariable(argument.value)
    ? cssVarsUsed.add(argument.value)
    : console.warn(`CSS Variable must start with '--'. Found: ${ argument.value }`)
}
