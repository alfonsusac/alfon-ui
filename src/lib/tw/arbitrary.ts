import parseValue from 'postcss-value-parser'

type Arbitrary = {
  cssVarUsed: string[],
}

export function analyzeArbitrary(arb?:
  | `[${ string }]`
  | `(--${ string })`
  | (string & {})
): Arbitrary {
  if (!arb) return { cssVarUsed: [] }

  let cssVarUsed: string[] = []

  if (arb.startsWith('[') && arb.endsWith(']')) {
    // process arbitrary
    const content = arb.slice(1, -1)
    parseValue(content).walk((node) => {
      if (node.type === 'word' && node.value.startsWith('--')) {
        cssVarUsed.push(node.value)
      }
    })
  }

  if (arb.startsWith('(--') && arb.endsWith(')')) {
    // process custom prop
    // const [firstpart, rest] = splitFirst(arb.slice(1, -1), ',')
    const content = arb.slice(1, -1)
    parseValue(content).walk((node) => {
      if (node.type === 'word' && node.value.startsWith('--')) {
        cssVarUsed.push(node.value)
      }
    })
  }

  return {
    cssVarUsed
  }
}