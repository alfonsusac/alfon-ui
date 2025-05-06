import parseValue from 'postcss-value-parser'
import { isCssVariable, type CssVarString } from '../css'

type Arbitrary = {
  cssVarUsed: CssVarString[],
}

export function analyzeArbitrary(arb?:
  | `[${ string }]`
  | `(--${ string })`
  | (string & {})
): Arbitrary {
  if (!arb) return { cssVarUsed: [] }

  let cssVarUsed: CssVarString[] = []

  if (arb.startsWith('[') && arb.endsWith(']')) {
    // process arbitrary
    const content = arb.slice(1, -1)
    parseValue(content).walk(node => {
      if (node.type === 'word'
        && node.value.startsWith('--')
        && isCssVariable(node.value)) cssVarUsed.push(node.value)
    })
  }

  if (arb.startsWith('(--') && arb.endsWith(')')) {
    // process custom prop
    const content = arb.slice(1, -1)
    parseValue(content).walk(node => {
      if (node.type === 'word'
        && node.value.startsWith('--')
        && isCssVariable(node.value)) cssVarUsed.push(node.value)
    })
  }
  return { cssVarUsed }
}