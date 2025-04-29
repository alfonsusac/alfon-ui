import postcss, { type AtRule, type Declaration } from "postcss";
import { isCssVariable, isTwTypePattern, type CssVariable, type ThemedTokenType } from "./css";
import valueParser, { type FunctionNode, type Node } from 'postcss-value-parser'

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


export function resolveCssVarsDependencyList(cssDependencyList: ReturnType<typeof getGlobalCSSDependencyList>['variableDeclarations']) {

  const variableDeclarations: Record<CssVariable, {
    value: string,
    cssVarsUsed: CssVariable[],
    resolved?: {
      cssVarsUsed: CssVariable[],
    }
  }> = cssDependencyList

  Object.entries(variableDeclarations).forEach(([k, value]) => {
    const key = k as CssVariable
    const cssVarsUsed = new Set<CssVariable>()
    const stack: CssVariable[] = [key as CssVariable]
    while (stack.length > 0) {
      const current = stack.pop()!
      cssVarsUsed.add(current)
      const declaration = variableDeclarations[current]
      if (declaration) {
        declaration.cssVarsUsed.forEach(v => {
          !cssVarsUsed.has(v) && stack.push(v)
        })
      }
    }
    variableDeclarations[key].resolved = { cssVarsUsed: [...cssVarsUsed] }
  })

  return {
    variableDeclarations,
  }
}

export function resolveCustomVariantDependencyList(
  customVariantDependencyList: ReturnType<typeof getGlobalCSSDependencyList>['atCustomVariants'],
  resolvedCssVarsDependencyList: ReturnType<typeof resolveCssVarsDependencyList>['variableDeclarations'],
) {
  const atCustomVariants: Record<CssVariable, {
    cssVarsUsed: CssVariable[]
    resolved?: { cssVarsUsed: CssVariable[] }
  }> = customVariantDependencyList
  Object.entries(customVariantDependencyList).forEach(
    ([_key, value]) => {
      const key = _key as CssVariable
      const cssVarsUsed = new Set<CssVariable>()
      value.cssVarsUsed.forEach(vars => {
        resolvedCssVarsDependencyList[vars]
          ?.resolved?.cssVarsUsed
          .map(v => cssVarsUsed.add(v))
      })
      atCustomVariants[key].resolved = { cssVarsUsed: [...cssVarsUsed] }
    }
  )
  return { atCustomVariants }
}

export function resolveAtUtilityDependencyList() {

}





// -- Process ClassNames

export function processClassName(input: string) {
  const variants: { raw: string, arbitrary?: string }[] = []
  let modifier:
    | { type: "normal" }
    | { type: "custom-property", customProperty?: { key?: string, value: string } }
    | { type: "arbitrary", arbitrary?: { key?: string, value: string } }
    | undefined = undefined
  let utility:
    | { isFullArbitrary: true }
    | ({ isFullArbitrary: false } & (
      | { type: "normal" }
      | { type: "custom-property", customProperty?: { key?: string, value: string } }
      | { type: "arbitrary", arbitrary?: { key?: string, value: string } }
    ))
    | undefined = undefined


  // ------

  try {
    processVariantOrUtility(input)
    if (!utility) throw new Error('Utility is required at the end')
    return {
      variants,
      modifier,
      utility
    }
  } catch (error) {
    console.log(error)
    return null
  }

  function processVariantOrUtility(_input: string) {
    console.log(`procesing variant/utility: ${ _input }`)
    let buffers = ''
    let _isFullArbitrary = _input.startsWith('[')
    for (let i = 0; i < _input.length; i++) {
      const char = _input[i]
      buffers += char
      if (char === '[' && i === 0) _isFullArbitrary = true
      if (char === '(' && i === 0) throw new Error("Invalid: custom-prop can't be at the start of a variant/utility")
      if (char === '(') {
        i++;
        const offset = processCustomProp(_input.slice(i))
        const start = i
        const end = i += offset + 1
        const customProperty = _input.slice(start, end - 1)
        buffers += customProperty + ')'

        if (i > _input.length) {
          // Buffer is a utility
        } else if (_input[i + 1] === '/') {
          // Buffer is a utility
          if (_isFullArbitrary) utility = { isFullArbitrary: true }
          else utility = { isFullArbitrary: false, type: 'custom-property', customProperty: { key: customProperty.includes(':') ? customProperty.split(':')[0] : undefined, value: customProperty.includes(':') ? customProperty.split(':')[1] : customProperty } }
          processModifier(_input.slice(i + 2))
        }

      } else if (char === '[') {
        i++;
        const offset = processArbitrary(_input.slice(i))
        const start = i
        const end = i += offset + 1
        const arbitrary = _input.slice(start, end - 1)
        buffers += arbitrary + ']'

        if (i > _input.length) {
          // Buffer is a utility
          if (_isFullArbitrary) utility = { isFullArbitrary: true }
          else utility = { isFullArbitrary: false, type: 'arbitrary', arbitrary: { key: arbitrary.includes(':') ? arbitrary.split(':')[0] : undefined, value: arbitrary.includes(':') ? arbitrary.split(':')[1] : arbitrary } }

          break;
        } else if (_input[i + 1] === ':') {
          // Buffer is a variant
          variants.push({ raw: buffers, arbitrary })
          processVariantOrUtility(_input.slice(i + 2))
          return

        } else if (_input[i + 1] === '/') {
          // Buffer is a utility
          if (_isFullArbitrary) utility = { isFullArbitrary: true }
          else utility = { isFullArbitrary: false, type: 'arbitrary', arbitrary: { key: arbitrary.includes(':') ? arbitrary.split(':')[0] : undefined, value: arbitrary.includes(':') ? arbitrary.split(':')[1] : arbitrary } }
          processModifier(_input.slice(i + 2))
          return

        } else {
          // Buffer is invalid...
          throw new Error(`Invalid: after close bracket, it either needs to be an eol, colon or a slash`)
        }
      }
    }
  }

  function processModifier(str: string) { // str's previous is '/'
    let i = 0
    if (!str.startsWith('[') && !str.startsWith('(')) {
      modifier = { type: 'normal' }
      return
    }

    while (i < str.length) {
      const char = str[i]
      if (char === '[') {
        i++;
        const offset = processArbitrary(str.slice(i))
        const start = i
        const end = i += offset + 1
        const arbitrary = str.slice(start, end - 1)
        modifier = {
          type: 'arbitrary', arbitrary: {
            key: arbitrary.includes(':') ? arbitrary.split(':')[0] : undefined,
            value: arbitrary.includes(':') ? arbitrary.split(':')[1] : arbitrary,
          }
        }
        return
      }
      if (char === '(') {
        i++;
        const offset = processCustomProp(str.slice(i))
        const start = i
        const end = i += offset + 1
        const customProperty = str.slice(start, end - 1)
        modifier = {
          type: 'custom-property', customProperty: {
            key: customProperty.includes(':') ? customProperty.split(':')[0] : undefined,
            value: customProperty.includes(':') ? customProperty.split(':')[1] : customProperty,
          }
        }
        return
      }
    }
  }
}

//             s                                                    e
//             0 1 2 3 4  5  6  7  8  9  10 11 12 13 14 15 16 17 18
// 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30
// d a t a - [ a c t \ [  i  v  e  s  =  t  r  u  e  \  [  \  ]  ]  :  h  o  v  e  r




/**
 * Process the part of className that is inside a square bracket
 */
function processArbitrary(str: string) {
  let i = 0
  while (i < str.length) {
    const char = str[i]       // i 5
    if (char === ']') break   // i 5
    if (char === '\\') i++    // i 5 
    i++                       // i 6
  }
  if (i >= str.length) throw new Error('Invalid: Arbitrary not closed')
  return i
}

// 0 1 2 3 4  5  6  7  8  9  10 11 12 13 14 15 16 17 18
// a c t \ [  i  v  e  s  =  t  r  u  e  \  [  \  ]  ]  :  h  o  v  e  r


function processCustomProp(str: string) {
  let i = 0
  let bracketStack = 0
  while (i < str.length) {
    const char = str[i]
    if (char === '(') bracketStack++
    if (char === ')') {
      bracketStack--
      if (bracketStack === 0) break
    }
    if (char === '\\') i++
    i++
  }
  if (i >= str.length) throw new Error('Invalid: Custom property not closed')
  return i
}



/// Next Version

type Result = {
  utility: string,
  variatns: string[],
  modifier?: string
}

export function parseTailwindClass(input: string) {
  const variants: string[] = [];
  let utility = '';
  let modifier: string | undefined;

  function recordUtility(what: string) {
    if (utility) throw new Error(`Utility already set: ${ utility }`)
    utility = what
  }
  function recordVariant(what: string) {
    variants.push(what)
  }
  function recordModifier(what: string) {
    if (modifier) throw new Error(`Modifier already set: ${ modifier }`)
    modifier = what
  }

  const len = input.length;
  let index = 0;
  let start = 0;
  const curr = () => input[index]
  const firstChar = () => index - start === 0;
  const hasNext = () => index < len
  const next = () => input[index + 1] || undefined
  const currIsLast = () => index + 1 === len
  const currIsEmpty = () => index === len
  const getBuffer = () => input.slice(start, index + 1) // inclusive
  const resetBufferAt = (where: number) => index = start = where


  function processArbitrary(start: number) {
    let done = false
    while (hasNext() && !done) {
      if (curr() === ']') done = true;
      if (curr() === '\\') index++;
      if (!done) index++;
    }
    if (index >= len && !done)
      throw new Error(`Invalid: Arbitrary not closed. Found: ${ input.slice(start) }`)
    const arbitrary = input.slice(start, index)
    return arbitrary // [test]
  }
  function processCustomProp(start: number) {
    let done = false
    let unclosedBrackets = 0
    while (hasNext() && !done) {
      if (curr() === '(') unclosedBrackets++
      if (curr() === '\\') index++;
      if (curr() === ')') unclosedBrackets--
      if (curr() === ')' && unclosedBrackets === 0) done = true
      if (!done) index++;
    }
    if (index >= len && !done)
      throw new Error(`Invalid: Custom property not closed. Found: ${ input.slice(start) }. Unclosed brackets: ${ unclosedBrackets }`)
    const customProperty = input.slice(start, index)
    return customProperty // (test)
  }

  function processModifier(start: number) {
    return input.slice(start)
  }

  let loops = 0

  // This loop mainly handles possibility of either [variant] or [utility]
  while (hasNext()) {
    if (++loops > 50)
      throw new Error(`Infinite loop detected: ${ loops }`)

    if (firstChar()) {
      if (curr() === '[') {
        const arbitrary = processArbitrary(index)
        if (curr() !== ']')
          throw new Error(`Dev Error: Arbitrary should be closed at this char[index], found: ${ input.slice(index) }, index: ${ index }`)
        // index is directly after ']'
        if (currIsEmpty()) {
          recordUtility(arbitrary)
          break
        }
        if (curr() === '/') {
          recordUtility(arbitrary)
          recordModifier(processModifier(index + 1))
          break
        }
        if (curr() === ':') {
          recordVariant(arbitrary)
          resetBufferAt(index + 1)
          continue
        }
      }
    }
    if (!firstChar()) {
      if (curr() === '[') {
        processArbitrary(index)
        if (curr() !== ']')
          throw new Error(`Dev Error: ']' expected at this char[index], found: ${ input.slice(index) }, index: ${ index }`)
        // index is now at end of arbitrary ']'
        if (currIsLast()) {
          recordUtility(getBuffer())
          break
        }
        if (next() === '/') {
          recordUtility(getBuffer())
          recordModifier(processModifier(index + 2))
          break
        }
        if (next() === ':') {
          recordVariant(getBuffer())
          resetBufferAt(index + 2)
          continue
        }
      }
      if (curr() === '(') {
        processCustomProp(index)
        if (curr() !== ')') throw new Error(`Dev Error: ')' expected at this char[index], found: ${ input.slice(index) }, index: ${ index }`)
        // index is now at end of custom property ')'
        recordUtility(getBuffer())
        if (currIsLast())
          break
        if (next() === '/') {
          recordModifier(processModifier(index + 2))
          break
        }
      }
      if (next() === '/') {
        recordUtility(getBuffer())
        recordModifier(processModifier(index + 2))
        break;
      }
      if (next() === ':') {
        // console.log("Hi?", input.slice(index))
        recordVariant(getBuffer())
        resetBufferAt(index + 2)
        continue
      }
      if (currIsLast()) {
        // console.log("C")
        recordUtility(getBuffer())
        break;
      }
    }
    index++;
  }

  // console.log(`v: ${ variants } | u: ${ utility } | m: ${ modifier }`)

  if (!utility)
    throw new Error(`Utility is required at the end. Buffer: ${ getBuffer() }`);
  return { utility, variants, modifier };
}