import valueParser from 'postcss-value-parser'
import { isCssVariable, type CssVariable } from './css'
import postcss from 'postcss'

export function parseDeclarationValue(str: string) {
  const parsed = valueParser(str)
  const walkVariables = (cb: (v: CssVariable, err: string | null) => void) => {
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

// export function parseCss(str: string) {
//   const parsed = postcss.parse(str)
//   const walkAtThemeRule = () {
//       const atThemeRules = new Set<string>()
//       parsed.walkAtRules('theme', (rule) => {
//         atThemeRules.add(rule.params)
//       })
//       return [...atThemeRules]
//   }
//   return {
//     ...parsed,
//   }
// }