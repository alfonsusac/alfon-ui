import postcss, { type AtRule, type Declaration } from "postcss";
import valueParser, { type FunctionNode, type Node } from 'postcss-value-parser'
import { isCssVariable, isTwTypePattern, type CssVariable, type ThemedTokenType } from "../css";

// Caveat/Assumptions:
// - no toplevel CSS rules. must use utility classes

export function getGlobalCSSDependencyList(globalCss: string) {
  const parsedCss = postcss.parse(globalCss)
  const variableDeclarations = new Map<CssVariable, {
    value: string,
    cssVarsUsed: CssVariable[]
  }>()
  const atUtilities = new Map<string, {
    // node: AtRule,
    customThemedTokenTypesValue: ThemedTokenType[],
    customThemedTokenTypesModifier: ThemedTokenType[],
    classNamesUsed: string[],
    variantsUsed: string[],
    cssVarsUsed: CssVariable[]
  }>
  const atCustomVariants = new Map<string, {
    // node: AtRule,
    value?: string,
    cssVarsUsed: CssVariable[]
  }>()

  function processVariablesUsedInParsedValueNode(n: Node, cssVarsUsed: Set<CssVariable>) {
    if (n.type !== 'function' || n.value !== 'var' || n.nodes[0].type !== 'word') return
    const argument = n.nodes[0]
    if (isCssVariable(argument.value)) cssVarsUsed.add(argument.value)
    else console.warn(`CSS Variable must start with '--'. Found: ${ argument.value }`)
  }
  function processAtThemeVariableDeclaration(d: Declaration) {
    const cssVarsUsed = new Set<CssVariable>()
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
  function processAtVariant(d: AtRule, variantsUsed: Set<string>) {
    variantsUsed.add(d.params)
  }
  function processAtUtility(atrule: AtRule) {
    const cssVarsUsed = new Set<CssVariable>()
    const classNamesUsed = new Set<string>()
    const variantsUsed = new Set<string>()
    const customThemedTokenTypesValue = new Set<ThemedTokenType>()
    const customThemedTokenTypesModifier = new Set<ThemedTokenType>()

    function processCustomThemedTokenTypesUsed(n: FunctionNode, customThemedTokenTypes: Set<ThemedTokenType>) {
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
  function processAtCustomVariant(atrule: AtRule) {
    const cssVarsUsed = new Set<CssVariable>()
    atrule.walk(d => {
      d.type === 'decl' && valueParser(d.value).walk(v => processVariablesUsedInParsedValueNode(v, cssVarsUsed))
    })
    atCustomVariants.set(atrule.params.split(' ')[0], {
      // node: atrule,
      value: atrule.params.slice(atrule.params.split(' ')[0].length + 1),
      cssVarsUsed: [...cssVarsUsed],
    })
  }
  parsedCss.walk(n => {
    n.type === 'atrule' && n.name === 'theme' && processAtTheme(n)
    n.type === 'atrule' && n.name === 'utility' && processAtUtility(n)
    n.type === 'atrule' && n.name === 'custom-variant' && processAtCustomVariant(n)
    // n.type === 'rule' && processRule(n) [no need to read rules: all class must use utility]
  })

  // -- Resolve Global CSS Dependency List

  return {
    variableDeclarations: Object.fromEntries(variableDeclarations),
    atUtilities: Object.fromEntries(atUtilities),
    atCustomVariants: Object.fromEntries(atCustomVariants),
  }
}