import { roughParseClassname } from "./parse-class-rough";

export function resolveComponentCSSDependency(
  classNamesUsed: string[]
) {
  const res = classNamesUsed.flatMap(c => {
    try { return roughParseClassname(c) } catch (error) { return [] }
  })
}