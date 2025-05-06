import { isCssVariable, isTwTypePattern } from "@/lib/css";
import type { Node } from "postcss-value-parser";

// parse-value.ts parses the value of a CSS property. 

type Callback<T> = (value: T) => void

export function extractVars(
  n: Node,
  cb: Callback<`--${ string }`>
) {
  if (n.type !== "function"
    || n.value !== "var"
    || n.nodes[0].type !== "word") return
  const argument = n.nodes[0].value
  if (isCssVariable(argument)) cb(argument)
}

export function extractUtilityThemeTypes(
  n: Node,
  cb: Callback<`--${ string }-*`>
) {
  if (n.type !== "function") return
  n.nodes
    .filter((a) => a.type === "word")
    .flatMap((a) => isTwTypePattern(a.value) ? [a.value] : [])
    .forEach((a) => cb(a))
}
