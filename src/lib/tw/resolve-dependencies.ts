import { analyzeArbitrary } from "./arbitrary";
import { roughParseClassname } from "./parse-class-rough";
import type { PreparsedGlobalCSS } from "./twcss/parse-globalcss";
import type { ResolvedCustomVariant } from "./twcss/resolve-custom-var";
import type { ResolvedVariableDeclarations } from "./twcss/resolve-var";
import { parseUtility } from "./utilities";
import { createVariantTree, walkVariants } from "./variants";


// Variable Declarations ------------------------------------------------
// 





// Custom Variant ------------------------------------------------
// 



// Utility ------------------------------------------------
//         - entangled with classNames
export type ResolvedUtility = {
  [key: string]: {
    cssVarsUsed: string[],
    customVariantsUsed: string[],
    modifierTypes: `--${ string }-*`[],
    valueTypes: `--${ string }-*`[],
  }
}

// TODO: this function will be used in the final step
//   when we resolved all the classnames.
export function resolveAtUtilitiesWithUnresolvedClassnames(
  atUtilities: Readonly<PreparsedGlobalCSS['atUtilities']>,
  resolvedCssVars: ResolvedVariableDeclarations,
  resolvedCustomVariants: ResolvedCustomVariant,
) {
  const resolved: ResolvedUtility = {}
  const atUtilitiesMap = new Map(Object.entries(atUtilities));

  // Step 1. Resolve non-self-referencing dependencies (cssVars, customVariants)
  // Step 2. Using map from step 1, Resolve self-referencing dependencies (@utiltity to @utility) and gather cssVars and customVariants

  // Intermediary map
  // - it already resolves cssVars and customVariant but not classNames
  const intermediaryMap = new Map<string, {
    classNamesUsed: string[],
    cssVarsUsed: string[],
    customVariantsUsed: string[],
    modifierTypes: `--${ string }-*`[],
    registeredModifiers: `--${ string }`[],
    valueTypes: `--${ string }-*`[],
    registeredValues: `--${ string }`[],
  }>()


  // Step 1.
  atUtilitiesMap.forEach((value, key) => {
    const cssVarsUsed: string[] = []
    const registeredModifiers: `--${ string }`[] = []
    const registeredValues: `--${ string }`[] = []

    // For each utilities,
    // 1. check for direct var declaration and save their dependencies
    // 2. save cssVars used in custom-variants
    // 3. save the modifier types and lookup available values in resolvedCssVars
    // 4. save the value types and lookup available values in resolvedCssVars

    // Checking for direct var declarations
    value.cssVarsUsed.forEach(cssVar => {
      resolvedCssVars[cssVar]?.resolvedCssVarsUsed.forEach(rcv => cssVarsUsed.push(rcv))
    })

    // Saving cssVars used in custom-variants
    value.variantsUsed.forEach(variant => {
      resolvedCustomVariants[variant]?.resolvedCssVarsUsed.forEach(rcv => cssVarsUsed.push(rcv))
    })

    // Save the modifier types
    value.customThemedTokenTypesModifier.forEach(modifierType => {
      // Find keys in resolvedCssVars that starts with modifierType
      const keys = Object.keys(resolvedCssVars).filter(key => key.startsWith(modifierType.split('-*')[0]))
      registeredModifiers.push(...keys as `--${ string }`[])
    })

    value.customThemedTokenTypesValue.forEach(valueType => {
      // Find keys in resolvedCssVars that starts with valueType
      const keys = Object.keys(resolvedCssVars).filter(key => key.startsWith(valueType.split('-*')[0]))
      registeredValues.push(...keys as `--${ string }`[])
    })

    // Save the result.
    intermediaryMap.set(key, {
      classNamesUsed: value.classNamesUsed,
      cssVarsUsed,
      customVariantsUsed: value.variantsUsed,
      modifierTypes: value.customThemedTokenTypesModifier,
      registeredModifiers,
      valueTypes: value.customThemedTokenTypesValue,
      registeredValues,
    })
  })


  // Step 2.
  intermediaryMap.forEach((value, key) => {
    const cssVarsVisited = new Set<string>()
    const customVariantsVisited = new Set<string>()
    const utilitiesVisited = new Set<string>()

    value.classNamesUsed.forEach(className => {
      // You can do this!
      // 1. Check Variants for custom-variants
      // 2. Check Utility for a) default utility + their token. b) custom utility + their token

      const res = roughParseClassname(className)

      // Checking variants for custom-variants
      res.variants.forEach(variantStr => {
        const variant = createVariantTree(variantStr)
        walkVariants(variant, variant => {
          if (variant.type !== 'custom variant') return
          // Assumption: all custom variants are static and it doesn't have dynamic values.
          const customVariant = resolvedCustomVariants[variant.prefix]
          if (customVariant) {
            customVariantsVisited.add(variant.prefix)
            customVariant.resolvedCssVarsUsed.forEach(rcv => cssVarsVisited.add(rcv))
          }
        })
      })

      // Checking utility for default utility + their token
      const utility = parseUtility(res.utility)
      if (utility.type === 'default arbitrary utility') {
        const arbitrary = analyzeArbitrary(utility.param)
        arbitrary.cssVarUsed.forEach(cssVar => {
          resolvedCssVars[cssVar]?.resolvedCssVarsUsed.forEach(rcv => cssVarsVisited.add(rcv))
        })
      } else if (utility.type === 'default themed or staticparam utility') {
        console.log(utility.param)
        // Get Param, get its utility type, match it with globalcss
      }

    })
  })





  // atUtilitiesMap.forEach((value, key) => {
  //   const cssVarsVisited = new Set<string>()
  //   const customVariantsVisited = new Set<string>()
  //   const utilitiesVisited = new Set<string>()

  //   value.cssVarsUsed.forEach(cssVar => {
  //     resolvedCssVars[cssVar]?.resolvedCssVarsUsed.forEach(rcv => {
  //       rcv && cssVarsVisited.add(rcv)
  //     })
  //   })
  //   value.variantsUsed.forEach(variant => {
  //     customVariantsVisited.add(variant)
  //     resolvedCustomVariants[variant]?.resolvedCssVarsUsed.forEach(rcv => {
  //       rcv && cssVarsVisited.add(rcv)
  //     })
  //   })

  //   value.classNamesUsed.forEach(className => {
  //     // const res = roughParseClassname(className)
  //     // const res = resolveClassName(className, resolvedCssVars, resolvedCustomVariants, utilitiesVisited ?? new Set())

  //   })

  //   value.classNamesUsed // <- resolve classnames

  //   resolved[key] = {
  //     cssVarsUsed: value.cssVarsUsed,
  //     customVariantsUsed: value.variantsUsed,
  //     valueTypes: value.customThemedTokenTypesValue,
  //     modifierTypes: value.customThemedTokenTypesModifier,
  //   }
  // })
  return resolved
}

function resolveUtility(
  resolvedCssVars: ResolvedVariableDeclarations,
  resolvedCustomVariants: ResolvedCustomVariant,
  utilitiesVisited?: Set<string>, // for classnames recursion
) {

}



// ClassName ------------------------------------------------
//           - entangled with atUtilities
export function resolveClassName(
  className: string,
  resolvedCssVars: ResolvedVariableDeclarations,
  resolvedCustomVariants: ResolvedCustomVariant,
  utilitiesVisited: Set<string>,
) {

}













// export function resolveComponentCSSDependency(
//   classNamesUsed: string[]
// ) {
//   const res = classNamesUsed.flatMap(c => {
//     try { return roughParseClassname(c) } catch (error) { return [] }
//   })
// }