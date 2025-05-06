import {
  isCssVariable,
  isTwTypePattern,
  type CssVarString,
} from "@/lib/css"
import postcss, { type AtRule } from "postcss"
import valueParser, { type Node } from "postcss-value-parser"
import { roughParseClassname } from "../parse-class-rough"
import { createVariantTree, walkVariants } from "../variants"
import { parseUtility, parseUtilityWithKnownUtilities, type UnresolvedCustomUtilityUsed, type UtilityUsed } from "../utilities"
import { analyzeArbitrary } from "../arbitrary"
import { extractUtilityThemeTypes, extractVars } from "./parse-value"

export type CssVar = {
  name: CssVarString
  value: string,
  meta: {
    cssVarsUsed: readonly CssVarString[]
  }
}
export type AtCustomVariant = {
  name: string
  meta: {
    cssVarsUsed: readonly CssVarString[]
  }
}
export type AtUtility = {
  meta: {
    classNamesUsed: readonly string[]
    cssVarsUsed: readonly CssVarString[]
    variantsUsed: readonly string[]
  }
} & ({
  name: string,
  type: "static"
} | {
  name: `${ string }-*`
  type: "dynamic"
  themedValueTypes: readonly `--${ string }-*`[]
  themedModifierTypes: readonly `--${ string }-*`[]
})


export function parseTailwindCSS(css: string) {
  const parsedCss = postcss.parse(css)

  // Phase 1 - parse all @theme, @utility, @custom-variant
  const variables = new Map<CssVarString, CssVar>()
  const atUtilities = new Map<string, AtUtility>()
  const atCustomVariants = new Map<string, AtCustomVariant>()
  parsedCss.walk((n) => {
    n.type === "atrule" && n.name === "theme" && processAtThemes(n, variables)
    n.type === "atrule" && n.name === "custom-variant" && processAtCustomVariants(n, atCustomVariants)
    n.type === "atrule" && n.name === "utility" && processAtUtilities(n, atUtilities)
  })

  type Resolved<T extends object> = T & {
    /** All CSS Vars Used in T including itself */
    allCssVarsUsed: readonly CssVarString[]
  }
  type ResolvedVariableDeclaration = Resolved<CssVar>
  type ResolvedAtCustomVariant = Resolved<AtCustomVariant>

  type ResolvedAtUtilityThemedValueParams = { resolvedVariableDeclarations: ResolvedVariableDeclaration[] }
  type ResolvedAtUtilityThemedModifierParams = { resolvedVariableDeclarations: ResolvedVariableDeclaration[] }
  type ResolvedValueParamTokenUsed = { tokensUsed: ResolvedVariableDeclaration[], allCssVarsUsed: readonly CssVarString[] }
  type IntermediaryAtUtility = Resolved<AtUtility> & {
    themedValueParams: Record<string, ResolvedAtUtilityThemedValueParams>
    valueParamsLookup: Record<string, ResolvedValueParamTokenUsed>
    themedModifierParams: Record<string, ResolvedAtUtilityThemedModifierParams>
    customUtilityUsed: UnresolvedCustomUtilityUsed[],
    customVariantsUsed: AtCustomVariant[],
  }

  const resolvedVariables = new Map<string, ResolvedVariableDeclaration>()
  const resolvedAtCustomVariants = new Map<string, ResolvedAtCustomVariant>()
  const intermediaryAtUtilities = new Map<string, IntermediaryAtUtility>()

  // Phase 2 - resolve all css variables used in each variable
  // resolve css variabls
  variables.forEach((val, key) => {
    const cssVarUsed = new Set<CssVarString>()
    const stack = [key]
    while (stack.length) {
      const cssVar = stack.pop()!
      cssVarUsed.add(cssVar)
      variables.get(cssVar)?.meta.cssVarsUsed.forEach(v => !cssVarUsed.has(v) && stack.push(v))
    }
    resolvedVariables.set(key, { ...val, allCssVarsUsed: [...cssVarUsed] })
  })

  // resolve custom variants
  atCustomVariants.forEach((val, key) => {
    const cssVarUsed = new Set<CssVarString>()
    val.meta.cssVarsUsed.forEach(v => {
      if (cssVarUsed.has(v)) return
      cssVarUsed.add(v)
      resolvedVariables.get(v)?.allCssVarsUsed.forEach(v => cssVarUsed.add(v))
    })
    resolvedAtCustomVariants.set(key, { ...val, allCssVarsUsed: [...cssVarUsed], })
  })

  // resolve utilities / construct utility dependency graph
  atUtilities.forEach((val, key) => {
    const cssVarUsed = new Set<CssVarString>()
    const themedValueParams = new Map<string, ResolvedAtUtilityThemedValueParams>()
    const themedModifierParams = new Map<string, ResolvedAtUtilityThemedModifierParams>()
    const customUtilityUsed: UnresolvedCustomUtilityUsed[] = []
    const customVariantsUsed = new Set<AtCustomVariant>()
    const valueParamsLookup = new Map<string, ResolvedValueParamTokenUsed>()

    // resolve css variables used
    val.meta.cssVarsUsed.forEach(v => {
      resolvedVariables.get(v)?.allCssVarsUsed.forEach((v) => cssVarUsed.add(v))
    })

    // resolve variants used
    val.meta.variantsUsed.forEach(v => {
      const customVariant = resolvedAtCustomVariants.get(v)
      if (!customVariant) return
      customVariantsUsed.add(customVariant)
      customVariant.allCssVarsUsed.forEach(v => {
        cssVarUsed.add(v)
        resolvedVariables.get(v)?.allCssVarsUsed.forEach(w => cssVarUsed.add(w))
      })
    })

    if (val.type === "dynamic") {
      // resolve themed value types
      val.themedValueTypes.forEach(t => {
        const resolvedVariableDeclarations = new Set<Resolved<CssVar>>()
        const typeName = t.split("-*")[0]
        resolvedVariables.forEach(cssvar => {
          if (!cssvar.name.startsWith(typeName)) return
          const tokenIdentifier = cssvar.name.split(typeName)[1].slice(1)
          valueParamsLookup.set(tokenIdentifier, {
            tokensUsed: [...(valueParamsLookup.get(tokenIdentifier)?.tokensUsed ?? []), cssvar],
            allCssVarsUsed: [...(valueParamsLookup.get(tokenIdentifier)?.allCssVarsUsed ?? []), ...cssvar.allCssVarsUsed]
          })

          // valueParamsLookup.set(tokenIdentifier, [...(valueParamsLookup.get(tokenIdentifier) ?? []), cssvar])
          cssvar.name.startsWith(typeName) && resolvedVariableDeclarations.add(cssvar)
        })
        themedValueParams.set(t, { resolvedVariableDeclarations: [...resolvedVariableDeclarations] })
      })
      // resolve themed modifier types
      val.themedModifierTypes.forEach((t) => {
        const resolvedVariableDeclarations = new Set<Resolved<CssVar>>()
        const typeName = t.split("-*")[0]
        resolvedVariables.forEach(cssvar => { cssvar.name.startsWith(typeName) && resolvedVariableDeclarations.add(cssvar) })
        themedModifierParams.set(t, { resolvedVariableDeclarations: [...resolvedVariableDeclarations] })
      })
    }

    val.meta.classNamesUsed.forEach((cn) => {
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

      utility.modifier?.cssVarUsed?.forEach(v => { resolvedVariables.get(v)?.allCssVarsUsed.forEach(v => cssVarUsed.add(v)) })

      if (utility.type === "default defined param utility") {
        // get this utility's value type.
        // match against the registered value type's values
        utility.valueTypes.forEach(v => { resolvedVariables.get(v.split("*")[0] + utility.param)?.allCssVarsUsed.forEach(v => cssVarUsed.add(v)) })
      } else if (utility.type === "default arbitrary utility") {
        const arb = analyzeArbitrary(utility.param)
        arb.cssVarUsed.forEach(v => { resolvedVariables.get(v)?.allCssVarsUsed.forEach(v => cssVarUsed.add(v)) })
      } else if (utility.type === "full arbitrary utility") {
        const arb = analyzeArbitrary(utility.full)
        arb.cssVarUsed.forEach(v => { resolvedVariables.get(v)?.allCssVarsUsed.forEach(v => cssVarUsed.add(v)) })
      } else if (utility.type === "custom utility") {
        customUtilityUsed.push(utility);
      }
    })

    intermediaryAtUtilities.set(key, {
      ...val,
      allCssVarsUsed: [...cssVarUsed],
      themedValueParams: Object.fromEntries(themedValueParams),
      themedModifierParams: Object.fromEntries(themedModifierParams),
      customUtilityUsed,
      customVariantsUsed: [...customVariantsUsed],
      valueParamsLookup: Object.fromEntries(valueParamsLookup)
    })
  })

  // Phase 3 - resolved all dependencies by traversing the dependency graph
  const resolvedAtUtilities = new Map<string, Omit<IntermediaryAtUtility, 'customUtilityUsed'> & { customUtilityUsed: IntermediaryAtUtility[] }>()
  intermediaryAtUtilities.forEach((val, key) => {

    // Context: dependency used in the classnames.
    const cssVarUsed = new Set<CssVarString>()
    const customVariantsUsed = new Set<AtCustomVariant>()
    const atUtilitiesUsed = new Set<IntermediaryAtUtility>()

    const stack: IntermediaryAtUtility[] = [val]
    while (stack.length) {
      const curr = stack.pop()!
      if (atUtilitiesUsed.has(curr)) continue
      atUtilitiesUsed.add(curr)
      curr.allCssVarsUsed.forEach(v => cssVarUsed.add(v))
      curr.customVariantsUsed.forEach(v => {
        customVariantsUsed.add(v)
        resolvedAtCustomVariants.get(v.name)?.allCssVarsUsed.forEach(v => cssVarUsed.add(v))
      })
      curr.customUtilityUsed.forEach(v => {
        // Resolve custom utility classname here.

        // dynamic utility
        [...intermediaryAtUtilities.entries()]
          .filter(([k, val]) => val.type === 'dynamic' && v.full.startsWith(k.split('-*')[0]))
          .forEach(([k, val]) => {
            const utility = parseUtilityWithKnownUtilities(v.full, k)
            if (utility.type !== 'custom static utility') {
              val.valueParamsLookup[utility.param].allCssVarsUsed.forEach(v => cssVarUsed.add(v))
            }
            stack.push(val)
          });

        // static utility
        [...intermediaryAtUtilities.entries()]
          .filter(([k, val]) => val.name === v.full)
          .forEach(([k, val]) => stack.push(val))
      })
    }
    resolvedAtUtilities.set(key, {
      ...val,
      allCssVarsUsed: [...cssVarUsed],
      customVariantsUsed: [...customVariantsUsed],
      customUtilityUsed: [...atUtilitiesUsed],
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
function processAtThemes(n: AtRule, variables: Map<string, CssVar>) {
  n.walkDecls((d) => {
    if (!d.variable || !isCssVariable(d.prop)) return
    const cssVarsUsed = new Set<CssVarString>()
    valueParser(d.value).walk(n => extractVars(n, cssvar => cssVarsUsed.add(cssvar)))
    variables.set(d.prop, {
      name: d.prop,
      value: d.value,
      meta: { cssVarsUsed: [...cssVarsUsed] }
    })
  })
}

// → #1 | Process @custom-variant [name] (value)
//        - reads direct css variables used
function processAtCustomVariants(n: AtRule, customVariants: Map<string, AtCustomVariant>,) {
  const cssVarsUsed = new Set<CssVarString>()
  const name = n.params.split(" ")[0]
  n.walkDecls((d) => { valueParser(d.value).walk(v => extractVars(v, cssvar => cssVarsUsed.add(cssvar))) })
  customVariants.set(name, { name, meta: { cssVarsUsed: [...cssVarsUsed] } })
}

// → #1 | Process @utility [name]
//        - extracts css variables used
//        - extracts class names used
//        - extracts modifier types
//        - extracts value types
function processAtUtilities(n: AtRule, utilities: Map<string, AtUtility>) {

  const type = n.params.endsWith("-*") ? "dynamic" : "static"
  const name = n.params

  const cssVarsUsed = new Set<CssVarString>()
  const variantsUsed = new Set<string>()
  const classNamesUsed = new Set<string>()

  const modifierTypes = new Set<`--${ string }-*`>()
  const valueTypes = new Set<`--${ string }-*`>()

  n.walk((d) => {
    if (d.type === "decl")
      valueParser(d.value).walk(n => {
        extractVars(n, cssvar => cssVarsUsed.add(cssvar))
        n.value === "--value" && extractUtilityThemeTypes(n, v => valueTypes.add(v))
        n.value === "--modifier" && extractUtilityThemeTypes(n, v => modifierTypes.add(v))
      })
    if (d.type === "atrule" && d.name === "apply")
      d.params.split(/\s+/).forEach((c) => classNamesUsed.add(c))
    if (d.type === "atrule" && d.name === "variant") variantsUsed.add(d.params)
  })

  if (type === "dynamic") {
    utilities.set(name, {
      name: name as `${ string }-*`,
      type,
      themedValueTypes: [...valueTypes],
      themedModifierTypes: [...modifierTypes],
      meta: {
        classNamesUsed: [...classNamesUsed],
        cssVarsUsed: [...cssVarsUsed],
        variantsUsed: [...variantsUsed],
      }
    })
    return
  }

  utilities.set(name, {
    name, type,
    meta: {
      classNamesUsed: [...classNamesUsed],
      cssVarsUsed: [...cssVarsUsed],
      variantsUsed: [...variantsUsed],
    }
  })
}