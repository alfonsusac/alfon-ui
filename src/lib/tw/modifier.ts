export function splitModifier(input: string) {
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
  return {
    modifier: input.slice(modifierIndex + 1),
    base: input.slice(0, modifierIndex),
  }
}


type Modifer = {
  
}