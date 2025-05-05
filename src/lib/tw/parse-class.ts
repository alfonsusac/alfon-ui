import { analyzeArbitrary } from "./arbitrary";
import { roughParseClassname, type RoughlyParsedClassname } from "./parse-class-rough";
import type { ResolvedCustomVariant } from "./twcss/resolve-custom-var";
import { parseUtility } from "./utilities";
import { createVariantTree } from "./variants";




// --- Part 1.5 ---

// export function getVariableUsedFromRoughParse(
//   roughParseClassname: RoughlyParsedClassname,
//   utility: Utility,
// ) {
//   const cssVarsUsed: string[] = utility.potentialThemeTokens || []
//   if (utility.param) {
//     const res = analyzeArbitrary(utility.param)
//     cssVarsUsed.push(...res.cssVarUsed)
//   }
//   if (roughParseClassname.modifier) {
//     const res = analyzeArbitrary(roughParseClassname.modifier)
//     cssVarsUsed.push(...res.cssVarUsed)
//   }
//   return [...cssVarsUsed]
// }





// --- Part 2 ---

export function resolveClassName(
  className: string,
  resolvedCustomVariants: ResolvedCustomVariant,
  // utilityMap: 
) {
  const variantsUsed = new Set<ResolvedCustomVariant[string]>()

  const { modifier, utility, variants } = roughParseClassname(className)
  
  variants.forEach(variantStr => {
    const variant = createVariantTree(variantStr)
    if (variant.type === 'custom variant') {
      // Assumption: all custom variants are static and it doesn't have dynamic values.
      const customVariant = resolvedCustomVariants[variant.prefix]
      if (customVariant) variantsUsed.add(customVariant)
    }
  })

  const parsedUtility = parseUtility(utility + (modifier ? `/${ modifier }` : ''))

  parsedUtility.type = 'custom utility'

}