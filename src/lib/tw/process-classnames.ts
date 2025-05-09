import { readFile } from "fs/promises";
import { roughParseClassname } from "./parse-class-rough";
import { parseTailwindCSS } from "./twcss/parse-css";
import { createVariantTree, walkVariants } from "./variants";
import { parseUtility, parseUtilityWithKnownUtilities } from "./utilities";
import type { CssVarString } from "../css";
import { analyzeArbitrary } from "./arbitrary";

export async function processClassNames(classNames: string[]) {
  const cssVarsUsed = new Set<CssVarString>();
  const utilitiesUsed = new Set<string>();
  const customVariantsUsed = new Set<string>();

  const defaultglobalcss = await readFile('./node_modules/tailwindcss/theme.css', 'utf-8')
  const globalcss = await readFile('./src/app/globals.css', 'utf-8')
  const css = parseTailwindCSS(defaultglobalcss + '\n' + globalcss)

  const defaultcss = parseTailwindCSS(defaultglobalcss)

  classNames.forEach(val => {
    console.log("Parsing: ", val)
    const parsed = roughParseClassname(val)
    parsed.variants.forEach(variant => {
      walkVariants(createVariantTree(variant), variant => {
        if (variant.type !== "custom variant") return
        const customVariant = css.atCustomVariants[variant.prefix]
        if (!customVariant) return
        customVariantsUsed.add(variant.prefix)
        customVariant.allCssVarsUsed.forEach(v => cssVarsUsed.add(v))
      })
    })
    const utility = parseUtility(parsed.utility + (parsed.modifier ? `/${ parsed.modifier }` : ""))
    utility.modifier?.cssVarUsed?.forEach(v => css.variableDeclarations[v]?.allCssVarsUsed.forEach(v => cssVarsUsed.add(v)))
    if (utility.type === "default defined param utility") {
      utility.valueTypes.forEach(v => { css.variableDeclarations[v.split('*')[0] + utility.param]?.allCssVarsUsed.forEach(v => cssVarsUsed.add(v)) })
    } else if (utility.type === "default arbitrary utility") {
      const arb = analyzeArbitrary(utility.param)
      arb.cssVarUsed.forEach(v => css.variableDeclarations[v]?.allCssVarsUsed.forEach(v => cssVarsUsed.add(v)))
    } else if (utility.type === 'full arbitrary utility') {
      const arb = analyzeArbitrary(utility.full)
      arb.cssVarUsed.forEach(v => css.variableDeclarations[v]?.allCssVarsUsed.forEach(v => cssVarsUsed.add(v)))
    } else if (utility.type === 'custom utility') {
      console.log(" is custom utility")


      const atUtilityEntries = [...Object.entries(css.atUtilities)]

      // dynamic utility
      atUtilityEntries
        .filter(([k, val]) => val.type === 'dynamic' && utility.full.startsWith(k.split('-*')[0]))
        .forEach(([k, val]) => {
          console.log("Dynamic utility: ", k)
          const parsedUtility = parseUtilityWithKnownUtilities(utility.full, k)
          if (parsedUtility.type !== 'custom static utility') {
            val.valueParamsLookup[parsedUtility.param].allCssVarsUsed?.forEach(v => cssVarsUsed.add(v))
          }
          utilitiesUsed.add(k)
          val.allCssVarsUsed.forEach(v => cssVarsUsed.add(v))
          val.customVariantsUsed.forEach(v => {
            customVariantsUsed.add(v.name)
            css.atCustomVariants[v.name]?.allCssVarsUsed.forEach(v => cssVarsUsed.add(v))
          })
        })

      // static utility
      atUtilityEntries
        .filter(([k, val]) => val.name === utility.full)
        .forEach(([k, val]) => {
          utilitiesUsed.add(k)
          val.allCssVarsUsed.forEach(v => cssVarsUsed.add(v))
          val.customVariantsUsed.forEach(v => {
            customVariantsUsed.add(v.name)
            css.atCustomVariants[v.name]?.allCssVarsUsed.forEach(v => cssVarsUsed.add(v))
          })
        })
    }
  })

  // Build css string
  const cssVarsNodeUsed = [...cssVarsUsed]
    .filter(v => !defaultcss.variableDeclarations[v])
    .map(v => {
      return css.variableDeclarations[v].node.toString()
    })
  const utilitiesNodeUsed = [...utilitiesUsed].map(v => {
    return css.atUtilities[v].node.toString()
  })
  const customVariantsNodeUsed = [...customVariantsUsed].map(v => {
    return css.atCustomVariants[v].node.toString()
  });

  const str = `@theme {\n`
    + cssVarsNodeUsed.map(e => `  ${ e }`).join('\n') + '\n}'
    + `\n\n`
    + utilitiesNodeUsed.map(e => e).join('\n')
    + `\n\n`
    + customVariantsNodeUsed.map(e => e).join('\n')

  return {
    cssVarsUsed: [...cssVarsUsed],
    utilitiesUsed: [...utilitiesUsed],
    customVariantsUsed: [...customVariantsUsed],

    str,

    // str: {
    //   cssVarsUsed: cssVarsNodeUsed.join('\n'),
    //   utilitiesUsed: utilitiesNodeUsed.join('\n'),
    //   customVariantsUsed: customVariantsNodeUsed.join('\n'),
    // }
    // classNames,
  }
}