export type RoughlyParsedClassname = {
  utility: string,
  variants: string[],
  modifier?: string,
}


export function roughParseClassname(input: string) {
  const variants: string[] = [];
  let utility = '';
  let modifier: string | undefined;

  const recordVariant = (value: string) => variants.push(value) 
  const recordUtility = (value: string) => {
    if (utility) throw new Error(`Utility already set: ${ utility }`)
    utility = value
  }
  const recordModifier = (value: string) => {
    if (modifier) throw new Error(`Modifier already set: ${ modifier }`)
    modifier = value
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
    let done = false
    while (hasNext() && !done) {
      if (curr() === ':') done = true
      if (!done) index++;
    }
    return input.slice(start, index)
  }

  let loops = 0

  // This loop mainly handles possibility of either [variant] or [utility]
  while (hasNext()) {
    if (++loops > 100) throw new Error(`Infinite loop detected: ${ loops }`)

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
        // Still has possibility of being a variant unless a `:` is found.
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
      const potentialUtility = getBuffer()
      const potentialModifier = processModifier(index + 2)
      if (curr() === ':') {
        recordVariant(potentialUtility + '/' + potentialModifier)
        resetBufferAt(index + 1)
      } else {
        recordUtility(potentialUtility)
        recordModifier(potentialModifier)
        break;
      }
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
    index++;
  }
  if (utility === undefined)
    throw new Error(`Utility is required at the end. Buffer: ${ getBuffer() }`);
  return { utility, variants, modifier };
}


