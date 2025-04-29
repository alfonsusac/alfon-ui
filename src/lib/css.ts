import { type AtRule } from "postcss";
import { type FunctionNode, type Node } from 'postcss-value-parser';
import declValueParser from 'postcss-value-parser';


export type CssVariable = `--${ string }`
export function isCssVariable(variable: string): variable is CssVariable {
  return variable.startsWith("--");
}

export type ThemedTokenType = `--${ string }-*`
export function isTwTypePattern(variable: string): variable is ThemedTokenType {
  return variable.startsWith("--") && variable.endsWith("-*");
}


// Tailwind PostCSS Helpers
export const twp = {
  parseDecl: declValueParser,

  isCssVariable(variable: string): variable is CssVariable {
    return variable.startsWith("--");
  },

  isVarFunction(
    n: Node
  ): n is FunctionNode & {
    nodes: [Node & { value: CssVariable }];
  } {
    const res = n.type === "function"
      && n.value === "var"
      && isCssVariable(n.nodes[0]?.value);
    return res;
  },

  extractCn(str: string) {
    return str.split(/\s+/)
  },

  extractTwTypePattern(f: FunctionNode) {
    return f.nodes
      .filter(v => v.type === "word")
      .flatMap(v => isTwTypePattern(v.value) ? [v.value] : [])
  },

  walkFunction(r: AtRule, fn?: (f: FunctionNode) => void) {
    r.walkDecls(d => {
      twp.parseDecl(d.value).walk(node => {
        if (twp.isVarFunction(node)) {
          fn?.(node);
        }
      })
    })
  }
}