import postcss, { type AtRule, type Declaration } from "postcss";
import valueParser, { type FunctionNode, type Node } from 'postcss-value-parser'
import { isCssVariable, isTwTypePattern, type CssVarString, type ThemedTokenTypeString } from "../../css";

export type PreparsedGlobalCSS = {
  variableDeclarations: Record<CssVarString, {
    value: string,
    cssVarsUsed: CssVarString[]
  }>
  atUtilities: Record<string, {
    customThemedTokenTypesValue: ThemedTokenTypeString[],
    customThemedTokenTypesModifier: ThemedTokenTypeString[],
    classNamesUsed: string[],
    variantsUsed: string[],
    cssVarsUsed: CssVarString[]
  }>
  atCustomVariants: Record<string, {
    value?: string,
    cssVarsUsed: CssVarString[]
  }>
}


// Caveat/Assumptions:
// - no toplevel CSS rules. must use utility classes

export function 
getGlobalCSSDependencyList(globalCss: string): PreparsedGlobalCSS {
  const parsedCss = postcss.parse(globalCss)
  const variableDeclarations = new Map<CssVarString, {
    value: string,
    cssVarsUsed: CssVarString[]
  }>()
  const atUtilities = new Map<string, {
    // node: AtRule,
    customThemedTokenTypesValue: ThemedTokenTypeString[],
    customThemedTokenTypesModifier: ThemedTokenTypeString[],
    classNamesUsed: string[],
    variantsUsed: string[],
    cssVarsUsed: CssVarString[]
  }>()
  const atCustomVariants = new Map<string, {
    // node: AtRule,
    value?: string,
    cssVarsUsed: CssVarString[]
  }>()


  parsedCss.walk(n => {
    n.type === 'atrule' && n.name === 'theme' && processAtTheme(n)
    n.type === 'atrule' && n.name === 'utility' && processAtUtility(n)
    n.type === 'atrule' && n.name === 'custom-variant' && processAtCustomVariant(n)
  })

  function processVariablesUsedInParsedValueNode(n: Node, cssVarsUsed: Set<CssVarString>) {
    if (n.type !== 'function' || n.value !== 'var' || n.nodes[0].type !== 'word') return
    console.log(`${n.type} \t ${n.value} \t ${n.nodes[0].type} \t ${n.nodes[0].value} \t ${isCssVariable(n.nodes[0].value)}`)
    const argument = n.nodes[0]
    if (isCssVariable(argument.value)) cssVarsUsed.add(argument.value)
    else console.warn(`CSS Variable must start with '--'. Found: ${ argument.value }`)
  }


  // --- Get Variable Declarations from @theme --------------------------

  function processAtThemeVariableDeclaration(d: Declaration) {
    const cssVarsUsed = new Set<CssVarString>()
    valueParser(d.value).walk(n => { processVariablesUsedInParsedValueNode(n, cssVarsUsed) })
    if (isCssVariable(d.prop))
      variableDeclarations.set(d.prop, {
        value: d.value,
        cssVarsUsed: [...cssVarsUsed]
      })
  }
  function processAtTheme(atrule: AtRule) {
    atrule.walk(d => { d.type === 'decl' && d.variable && processAtThemeVariableDeclaration(d) })
  }
  function processAtApply(d: AtRule, classNamesUsed: Set<string>) {
    d.params.split(/\s+/).forEach(c => classNamesUsed.add(c))
  }
  // ------------------------------------------------------------------





  function processAtVariant(d: AtRule, variantsUsed: Set<string>) {
    variantsUsed.add(d.params)
  }

  // --- Get Custom Variants from @custom-variants --------------------------

  function processAtUtility(atrule: AtRule) {
    const cssVarsUsed = new Set<CssVarString>()
    const classNamesUsed = new Set<string>()
    const variantsUsed = new Set<string>()
    const customThemedTokenTypesValue = new Set<ThemedTokenTypeString>()
    const customThemedTokenTypesModifier = new Set<ThemedTokenTypeString>()

    function processCustomThemedTokenTypesUsed(n: FunctionNode, customThemedTokenTypes: Set<ThemedTokenTypeString>) {
      n.nodes
        .filter(a => a.type === "word")
        .flatMap(a => isTwTypePattern(a.value) ? [a.value] : [])
        .forEach(a => { customThemedTokenTypes.add(a) })
    }

    function processDeclaration(d: Declaration) {
      valueParser(d.value).walk(n => {
        processVariablesUsedInParsedValueNode(n, cssVarsUsed)
        n.type === 'function' && n.value === '--value' && processCustomThemedTokenTypesUsed(n, customThemedTokenTypesValue)
        n.type === 'function' && n.value === '--modifier' && processCustomThemedTokenTypesUsed(n, customThemedTokenTypesModifier)
      })
    }

    atrule.walk(d => {
      d.type === 'decl' && processDeclaration(d)
      d.type === 'atrule' && d.name === 'apply' && processAtApply(d, classNamesUsed)
      d.type === 'atrule' && d.name === 'variant' && processAtVariant(d, variantsUsed)
    })

    atUtilities.set(atrule.params, {
      // node: atrule,
      classNamesUsed: [...classNamesUsed],
      variantsUsed: [...variantsUsed],
      cssVarsUsed: [...cssVarsUsed],
      customThemedTokenTypesValue: [...customThemedTokenTypesValue],
      customThemedTokenTypesModifier: [...customThemedTokenTypesModifier]
    })
  }
  // ------------------------------------------------------------------




  // --- Get Custom Variants from @custom-variants --------------------------

  function processAtCustomVariant(atrule: AtRule) {
    const cssVarsUsed = new Set<CssVarString>()
    atrule.walk(d => {
      d.type === 'decl' && valueParser(d.value).walk(v => processVariablesUsedInParsedValueNode(v, cssVarsUsed))
    })
    atCustomVariants.set(atrule.params.split(' ')[0], {
      // node: atrule,
      value: atrule.params.slice(atrule.params.split(' ')[0].length + 1),
      cssVarsUsed: [...cssVarsUsed],
    })
  }
  // ------------------------------------------------------------------


  return {
    variableDeclarations: Object.fromEntries(variableDeclarations),
    atUtilities: Object.fromEntries(atUtilities),
    atCustomVariants: Object.fromEntries(atCustomVariants),
  }
}