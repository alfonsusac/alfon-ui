import type { CssVariableString, ThemedTokenTypeString } from "../css";
import { analyzeArbitrary } from "./arbitrary";

export function extractModifier(input: string) {
  let index = 0;
  let bracketStack: string[] = [];
  let modifierIndex = -1;
  let done = false;

  const curr = () => input[index]

  while (curr() !== undefined && !done) {
    if (['[', '(', '{', '<'].includes(curr())) bracketStack.push(curr())
    if (curr() === ']' && bracketStack.at(-1) === '[') bracketStack.pop()
    if (curr() === ')' && bracketStack.at(-1) === '(') bracketStack.pop()
    if (curr() === '}' && bracketStack.at(-1) === '{') bracketStack.pop()
    if (curr() === '>' && bracketStack.at(-1) === '<') bracketStack.pop()
    if (curr() === '\\') index++
    if (curr() === '/' && bracketStack.length === 0) {
      done = true
      modifierIndex = index
    }
    index++
  }

  if (modifierIndex < 0) {
    return {
      modifier: undefined,
      base: input,
    }
  }

  const modifier = (() => {
    const full = input.slice(modifierIndex + 1)
    const isArbitrary = (
      (full.startsWith('[') && full.startsWith(']')) ||
      (full.startsWith('(') && full.startsWith(')'))
    ) ? true : false
    if (isArbitrary) {
      const arbitrary = analyzeArbitrary(full)
      return {
        full,
        type: "arbitrary" as const,
        arbitrary,
      }
    } else {
      return {
        full,
        type: "defined" as const,
        resolve(themedTokens: ThemedTokenTypeString[]) {
          return {
            cssVarUsed: themedTokens.map(t => `${ t.split('*')[0] + full }`),
          }
        }
      }
    }
  })()

  return {
    modifier,
    base: input.slice(0, modifierIndex),
  }
}



export type Modifier = {
  full: string
  type: "arbitrary" | "defined"
  cssVarUsed?: CssVariableString[]
} | undefined

export function extractModifier2(input: string) {
  let index = 0;
  let bracketStack: string[] = [];
  let modifierIndex = -1;
  let done = false;

  const curr = () => input[index]

  while (curr() !== undefined && !done) {
    if (['[', '(', '{', '<'].includes(curr())) bracketStack.push(curr())
    if (curr() === ']' && bracketStack.at(-1) === '[') bracketStack.pop()
    if (curr() === ')' && bracketStack.at(-1) === '(') bracketStack.pop()
    if (curr() === '}' && bracketStack.at(-1) === '{') bracketStack.pop()
    if (curr() === '>' && bracketStack.at(-1) === '<') bracketStack.pop()
    if (curr() === '\\') index++
    if (curr() === '/' && bracketStack.length === 0) {
      done = true
      modifierIndex = index
    }
    index++
  }

  if (modifierIndex < 0)
    return { getModifier: () => undefined, base: input }

  return {
    base: input.slice(0, modifierIndex),
    getModifier: (themedTokens?: ThemedTokenTypeString[]): Modifier => {
      const full = input.slice(modifierIndex + 1)
      const isArbitrary = (
        (full.startsWith('[') && full.startsWith(']')) ||
        (full.startsWith('(') && full.startsWith(')'))
      ) ? true : false
      return {
        full,
        type: isArbitrary ? "arbitrary" as const : "defined" as const,
        cssVarUsed: (isArbitrary ? analyzeArbitrary(full).cssVarUsed : themedTokens?.map(t => `${ t.split('*')[0] + full }` as CssVariableString) )?? [],
      }
    }
    // getModifier: <T extends ThemedTokenTypeString[] | undefined>(themedTokens?: T) => {
    //   const modifier = (() => {
    //     const full = input.slice(modifierIndex + 1)
    //     const isArbitrary = (
    //       (full.startsWith('[') && full.startsWith(']')) ||
    //       (full.startsWith('(') && full.startsWith(')'))
    //     ) ? true : false
    //     if (isArbitrary) {
    //       const arbitrary = analyzeArbitrary(full)
    //       return {
    //         full,
    //         type: "arbitrary" as const,
    //         cssVarUsed: arbitrary.cssVarUsed,
    //       }
    //     } else {
    //       return {
    //         full,
    //         type: "defined" as const,
    //         cssVarUsed: (themedTokens?.map(t => `${ t.split('*')[0] + full }`) ?? undefined),
    //       } as T extends undefined ? {
    //         full: string,
    //         type: "defined",
    //       } : {
    //         full: string,
    //         type: "defined",
    //         cssVarUsed: CssVariableString[],
    //       }
    //     }
    //   })()

    //   return modifier
    // }
  }
  // return 
}
