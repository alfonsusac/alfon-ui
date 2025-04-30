const ariaVariants = ["aria-busy", "aria-checked", "aria-disabled", "aria-expanded", "aria-hidden", "aria-pressed", "aria-readonly", "aria-required", "aria-selected"]
const defaultBreakpoints = ["sm", "md", "lg", "xl", "2xl"]
const defaultContainerBreakpoints = ["3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl"]

// Can be in not-[], group-[], peer-[], in-[], has-[]
const genericVariants = [
  "first", "last", "only", "odd", "even", "first-of-type", "last-of-type", "only-of-type",
  "visited", "target", "open", "default", "checked", "indeterminate", "placeholder-shown", "autofill",
  "optional", "required", "valid", "invalid", "user-valid", "user-invalid", "in-range", "out-of-range",
  "read-only", "empty", "focus-within", "hover", "focus", "focus-visible", "active", "enabled", "disabled", "inert"
] as const

// Can be in not-[] only
const notprefixprefixableVariants = [
  "motion-safe", "motion-reduce", "contrast-more", "contrast-less",
  "portrait", "landscape", "dark", "print", "forced-colors", "interted-colors",
  "pointer-none", "pointer-coarse", "pointer-fine", "any-pointer-none", "any-pointer-coarse", "any-pointer-fine",
  "noscript"
] as const

const uniqueVariants = [
  "starting", "first-letter", "first-line", "marker", "selection", "file", "placeholder", "backdrop", "details-content"
] as const

const nestableArbitraryVariants = [
  "not-[]", "group-[]", "peer-[]", "in-[]", "has-[]",
] as const
type NestableVariants = typeof nestableArbitraryVariants[number] extends `${ infer Prefix }[]` ? Prefix : never


const nonnestableArbitraryVariants = [
  "nth-[]", "nth-last-[]", "nth-of-type-[]", "nth-last-of-type-[]",
  "supports-[]",
  "max-[]", "min-[]", "@max-[]", "@min-[]",
  "aria-[]", "data-[]",
  "@[]",
] as const

function getDefaultTailwindVariants() {
  return [
    ...nestableArbitraryVariants,
    ...nonnestableArbitraryVariants,
    ...ariaVariants,
    ...genericVariants,
    ...notprefixprefixableVariants,
    ...uniqueVariants,

    ...defaultBreakpoints,
    ...defaultBreakpoints.map(bp => `min-${ bp }`),
    ...defaultBreakpoints.map(bp => `max-${ bp }`),

    ...defaultContainerBreakpoints.map(bp => `@${ bp }`),
    ...defaultContainerBreakpoints.map(bp => `@min-${ bp }`),
    ...defaultContainerBreakpoints.map(bp => `@max-${ bp }`),

    ...genericVariants.map(v => `not-${ v }`),
    ...genericVariants.map(v => `group-${ v }`),
    ...genericVariants.map(v => `peer-${ v }`),
    ...genericVariants.map(v => `in-${ v }`),
    ...genericVariants.map(v => `has-${ v }`),
    ...notprefixprefixableVariants.map(v => `not-${ v }`),
  ] as const
}

const breakpointApplicableVariantPrefixes = ['not-', 'max-', 'min-']
const containerBreakpointApplicableVariantPrefixes = ['@', '@min-', '@max-']

function getProjectResolvedTailwindVariantsFromTokens(parsedConfig: {
  customBreakpointTokens: string[],
  customContainerBreakpointTokens: string[],
}) {
  return [
    ...parsedConfig.customBreakpointTokens,
    ...breakpointApplicableVariantPrefixes.flatMap(prefix => {
      return parsedConfig.customBreakpointTokens.map(bp => `${ prefix }${ bp }`)
    }),
    ...containerBreakpointApplicableVariantPrefixes.flatMap(prefix =>
      parsedConfig.customContainerBreakpointTokens.map(bp =>
        `${ prefix }${ bp }`
      )
    ),
  ]
}

const removeTheSquareBrackets = (variant: string) => variant.replace(/\[\]/g, '')
function getVariantModifierAndArbitrary(variant: string) {
  // TODO: remove arbitrary feature. then rename function.
  let index = 0;
  let bracketStack = 0;
  let modifierIndex = -1;
  let firstBracketIndex = -1;
  let done = false
  while (variant[index] !== undefined && !done) {
    if (variant[index] === '[') {
      bracketStack++
      if (firstBracketIndex < 0) firstBracketIndex = index
    }
    if (variant[index] === ']') {
      bracketStack--
    }
    if (variant[index] === '/' && bracketStack === 0) {
      modifierIndex = index
      done = true
    }
    if (variant[index] === '\\') index++
    index++
  }
  if (modifierIndex < 0) {
    return {
      modifier: undefined,
      base: variant,
    }
  } else {
    const modifier = variant.slice(modifierIndex + 1)
    const variantWithoutModifier = variant.slice(0, modifierIndex)
    return {
      modifier,
      base: variantWithoutModifier,
    }
  }
}


export type Variant = {
  full: string,
  prefix: ReturnType<typeof getDefaultTailwindVariants>[number],
  type: "arbitrary nestable variant" | "nestable variant" | "arbitrary non-nestable variant" | "non-nestable variant" | "full arbitrary variant" | "custom variant",
  modifier?: string,
} & ({
  nested: true,
  params: Variant,
} | {
  nested: false,
  params?: string,
  isArbitrary: boolean
})

export function parseVariant(_variant: string, root = true): Variant {

  const full = _variant
  let {
    base: variant,
    modifier,
  } = root ? getVariantModifierAndArbitrary(_variant) : { base: _variant, modifier: undefined }


  const nestedArbitraryVariantsUsed = nestableArbitraryVariants.map(v => v.replace(/\[\]$/, '')).filter(v => variant.startsWith(v))[0]
  if (nestedArbitraryVariantsUsed) {
    const prefix = nestedArbitraryVariantsUsed
    const paramString = variant.slice(nestedArbitraryVariantsUsed.length)
    const isUsingArbitrary = paramString.startsWith('[') && paramString.endsWith(']')
    if (isUsingArbitrary) {
      return {
        full, modifier, prefix,
        type: "arbitrary nestable variant",
        nested: false,
        isArbitrary: true,
        params: paramString.slice(1, -1),
      }
    }
    return {
      full, modifier, prefix,
      type: "nestable variant",
      nested: true,
      params: parseVariant(paramString, false),
    }
  }

  const variantsUsed = nonnestableArbitraryVariants.map(v => v.replace(/\[\]$/, '')).filter(v => variant.startsWith(v))[0]
  if (variantsUsed) {
    const prefix = variantsUsed
    const nested = false
    const paramString = variant.slice(variantsUsed.length)
    const isUsingArbitrary = paramString.startsWith('[') && paramString.endsWith(']')
    if (isUsingArbitrary) {
      return {
        full, modifier, prefix, nested,
        type: "arbitrary non-nestable variant",
        isArbitrary: true,
        params: paramString.slice(1, -1),
      }
    }
    return {
      full, modifier, prefix, nested,
      type: "non-nestable variant",
      isArbitrary: false,
      params: paramString,
    }
  }

  const isArbitrary = variant.startsWith('[') && variant.endsWith(']')
  return {
    full, modifier,
    prefix: '',
    type: isArbitrary ? 'full arbitrary variant' : 'custom variant',
    nested: false,
    isArbitrary,
  }



  //   ...((getTheRest: (params: string) => Omit<Variant, "full">) => {
  //     if (root && variant.includes('/')) {
  //       const [params, modifier] = variant.split('/')
  //       return { modifier: modifier, ...getTheRest(params) } as const
  //     }
  //     return { modifier: undefined, ...getTheRest(variant) } as const
  //   })(params => {




  //     const nestedArbitraryVariantsUsed = nestableArbitraryVariants.map(removeTheSquareBrackets).filter(v => variant.startsWith(v))[0]
  //     // if (nestedArbitraryVariantsUsed) {
  //     // even if its nested variant, an arbitrary variant can be used
  //     return {
  //       type: nestedArbitraryVariantsUsed,
  //       nested: true,
  //       params: parseVariant(params.slice(nestedArbitraryVariantsUsed.length), false),
  //     } as const
  //     // }

  //     // return {
  //     // type: 
  //     // }
  //   })

  // }



  // const getParamsAndModifier = () => {
  //   if (root && variant.includes('/')) {
  //     const [params, modifier] = variant.slice(nestedArbitraryVariantsUsed.length).split('/')
  //     return {
  //       params: parseVariant(params),
  //       modifier,
  //     } as const
  //   }
  //   return {
  //     params: parseVariant(variant.slice(nestedArbitraryVariantsUsed.length)),
  //   } as const
  // }

  // const getVariantDetails = () => {
  //   const nestedArbitraryVariantsUsed = nestableArbitraryVariants.map(removeTheSquareBrackets).filter(v => variant.startsWith(v))[0]
  //   if (nestedArbitraryVariantsUsed) {
  //     return {
  //       type: nestedArbitraryVariantsUsed,
  //       nested: true,
  //       ...getParamsAndModifier(),
  //     } as const
  //   }
  //   const variantsUsed = nonnestableArbitraryVariants.map(removeTheSquareBrackets).filter(v => variant.startsWith(v))[0]
  //   if (variantsUsed) {
  //     return {
  //       type: variantsUsed,
  //       params: variant.slice(variantsUsed.length),
  //       nested: false,
  //     } as const
  //   }
  //   return {
  //     type: variant,
  //     params: variant,
  //     nested: false,
  //   } as const

  // }



  // return {
  //   full: variant,
  //   ...getVariantDetails(),
  //   // type: '',
  //   // nested: false,
  //   // isArbitrary: false,
  // }


  // const nestedArbitraryVariantsUsed = nestableArbitraryVariants.map(v => v.replace(/\[\]$/, '')).filter(v => variant.startsWith(v))[0]

  // if (nestedArbitraryVariantsUsed) {
  //   const params = parseVariant(variant.slice(nestedArbitraryVariantsUsed.length))
  //   return {
  //     full: variant,
  //     type: nestedArbitraryVariantsUsed,
  //     nested: true,
  //     params,
  //   }
  // } else {
  //   const variantsUsed = nonnestableArbitraryVariants.map(v => v.replace(/\[\]$/, '')).filter(v => variant.startsWith(v))[0]
  //   if (variantsUsed) {
  //     return {
  //       full: variant,
  //       type: variantsUsed,
  //       nested: false,
  //       params: variant.slice(variantsUsed.length),
  //       isArbitrary: false,
  //     }
  //   }
  //   const isArbitrary = variant.startsWith('[') && variant.endsWith(']')
  //   if (isArbitrary) {
  //     return {
  //       full: variant,
  //       type: variantsUsed,
  //       nested: false,
  //       params: variant.slice(1, -1) || undefined,
  //       isArbitrary,
  //     }
  //   }
  //   return {
  //     full: variant,
  //     type: variant,
  //     nested: false,
  //     isArbitrary: false,
  //   }

  // }
}