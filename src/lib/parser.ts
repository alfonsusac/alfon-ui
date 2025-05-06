import valueParser from 'postcss-value-parser'
import { isCssVariable, type CssVarString } from './css'
import postcss from 'postcss'

export function parseDeclarationValue(str: string) {
  const parsed = valueParser(str)
  const walkVariables = (cb: (v: CssVarString, err: string | null) => void) => {
    parsed.walk((node) => {
      if (node.type === 'function' && node.value === 'var') {
        const variable = node.nodes[0]?.value
        if (variable && isCssVariable(variable)) cb(variable, null)
      }
    })
  }
  return {
    ...parsed,
    walkVariables,
  }
}
