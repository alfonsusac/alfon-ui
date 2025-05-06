import type { CssVarString, ThemedTokenTypeString } from "../css"
import { analyzeArbitrary } from "./arbitrary"
import { extractModifier, extractModifier2 } from "./modifier"

type DefaultThemedTokenTypes =
  | '--animate-*'
  | '--blur-*'
  | '--breakpoint-*'
  | '--color-*'
  | '--container-*'
  | '--drop-shadow-*'
  | '--ease-*'
  | '--font-*'
  | '--inset-shadow-*'
  | '--leading-*'
  | '--radius-*'
  | '--shadow-*'
  | '--spacing-*'
  | '--text-*'
  | '--tracking-*'


type DefaultUtility = {
  [key: string]: (
    | 'arbitrary'      // allow arbitrary paras like -8, -[hello], -(--hello)
    | 'bracketless-arbitrary'
    | 'static'         // allow static params like -off, -auto
    | DefaultThemedTokenTypes // param refers to themedTokens
    | `key:${ string }`
    | `/${ DefaultThemedTokenTypes }` // modifiers refers to themedTokens
    | `paramless`      // allow not providing params
    | `arbitrary-modifier`
  )[]
}

// Default Utility Types
// - static utilities (no params, no arbitrary)
// - dynamic utilitites (has value or arbitrary-able or that it can be themed)

// TODO: after analyzing the tailwind, analyze the keyed arbitrary params from tailwind docs.
// TODO: after ^ that, extract customVars used and utility used

const defaultUtilities = {
  "absolute": [],
  "align": ['static', 'arbitrary'],
  "animate": ['static', 'arbitrary', '--animate-*'],
  "appearance": ['static'],
  "aspect": ['static', 'arbitrary', 'bracketless-arbitrary'],
  "auto-cols": ['static', 'arbitrary'],
  "auto-rows": ['static', 'arbitrary'],
  "backdrop-blur": ['paramless', 'static', 'arbitrary', '--blur-*'],
  "backdrop-brightness": ['arbitrary', 'bracketless-arbitrary'],
  "backdrop-contrast": ['arbitrary', 'bracketless-arbitrary'],
  "backdrop-grayscale": ['paramless', 'arbitrary', 'bracketless-arbitrary'],
  "backdrop-hue-rotate": ['arbitrary', 'bracketless-arbitrary'],
  "backdrop-invert": ['paramless', 'arbitrary', 'bracketless-arbitrary'],
  "backdrop-opacity": ['arbitrary', 'bracketless-arbitrary'],
  "backdrop-saturate": ['arbitrary', 'bracketless-arbitrary'],
  "backdrop-sepia": ['paramless', 'arbitrary', 'bracketless-arbitrary'],
  "backface": ['static'],
  "basis": ['arbitrary', 'bracketless-arbitrary', '--container-*', '--spacing-*'],
  "bg": ['static', 'arbitrary', '--color-*', 'key:image', 'arbitrary-modifier'], // bgColor, bgPosition, bgAttachment, bgRepeat, bgImage: none
  "bg-blend": ['static'],
  "bg-clip": ['static'],
  "bg-conic": ['paramless', 'bracketless-arbitrary', 'arbitrary'],
  "bg-gradient-to": ['static'],
  "bg-linear": ['static', 'bracketless-arbitrary', 'arbitrary'],
  "bg-origin": ['static'],
  "bg-radial": ['paramless', 'arbitrary'],
  "bg-repeat": ['static', 'paramless'],
  "block": [],
  "blur": ['paramless', 'arbitrary', '--blur-*'],
  "border": ['static', 'paramless', 'bracketless-arbitrary', 'arbitrary', 'static', '--color-*', 'key:length'],
  // borderWidth, borderCollapse, borderStyle,
  "border-b": ['static', 'paramless', 'bracketless-arbitrary', 'arbitrary', 'static', '--color-*'], // borderColor, borderWidth
  "border-e": ['static', 'paramless', 'bracketless-arbitrary', 'arbitrary', 'static', '--color-*'], // borderColor, borderWidth
  "border-l": ['static', 'paramless', 'bracketless-arbitrary', 'arbitrary', 'static', '--color-*'], // borderColor, borderWidth
  "border-r": ['static', 'paramless', 'bracketless-arbitrary', 'arbitrary', 'static', '--color-*'], // borderColor, borderWidth
  "border-s": ['static', 'paramless', 'bracketless-arbitrary', 'arbitrary', 'static', '--color-*'], // borderColor, borderWidth
  "border-spacing": ['bracketless-arbitrary', 'arbitrary', '--spacing-*'],
  "border-spacing-x": ['bracketless-arbitrary', 'arbitrary', '--spacing-*'],
  "border-spacing-y": ['bracketless-arbitrary', 'arbitrary', '--spacing-*'],
  "border-t": ['static', 'paramless', 'bracketless-arbitrary', 'arbitrary', 'static', '--color-*'], // borderColor, borderWidth
  "border-x": ['static', 'paramless', 'bracketless-arbitrary', 'arbitrary', 'static', '--color-*'], // borderColor, borderWidth
  "border-y": ['static', 'paramless', 'bracketless-arbitrary', 'arbitrary', 'static', '--color-*'], // borderColor, borderWidth
  "bottom": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "box": ['static'], // boxSizing, boxDecoration
  "break": ['static'],
  "break-after": ['static'],
  "break-before": ['static'],
  "break-inside": ['static'],
  "brightness": ['arbitrary', 'bracketless-arbitrary'],
  "capitalize": [],
  "caption": ['static'],
  "caret": ['static', 'arbitrary', '--color-*'],
  "clear": ['static'],
  "col": ['static', 'arbitrary', 'bracketless-arbitrary'],
  "col-end": ['static', 'arbitrary', 'bracketless-arbitrary'],
  "col-span": ['static', 'arbitrary', 'bracketless-arbitrary'],
  "col-start": ['static', 'arbitrary', 'bracketless-arbitrary'],
  "columns": ['static', 'arbitrary', 'bracketless-arbitrary', '--container-*'],
  "contain": ['static', 'arbitrary', 'bracketless-arbitrary'],
  "container": [],
  "content": ['static', 'arbitrary'],
  "contents": [],
  "contrast": ['arbitrary', 'bracketless-arbitrary'],
  "cursor": ['static', 'arbitrary'],
  "decoration": ['static', 'arbitrary', 'bracketless-arbitrary', '--color-*', 'arbitrary-modifier'],
  "delay": ['arbitrary', 'bracketless-arbitrary'],
  "diagonal-fractions": [],
  "divide": ['static', '--color-*', 'arbitrary'],
  "divide-x": ['static', 'bracketless-arbitrary', 'arbitrary'],
  "divide-y": ['static', 'bracketless-arbitrary', 'arbitrary'],
  "drop-shadow": ['paramless', 'static', '--color-*', '--drop-shadow-*', 'arbitrary', 'key:color'],
  "duration": ['arbitrary', 'bracketless-arbitrary', 'static'],
  "ease": ['arbitrary', '--ease-*', 'static'],
  "end": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "field-sizing": ['static'],
  "fill": ['static', 'arbitrary', '--color-*'],
  "fixed": [],
  "flex": ['static', 'arbitrary', 'bracketless-arbitrary'],
  "float": ['static'],
  "flow-root": [],
  "font": ['static', 'arbitrary', '--font-*', 'key:family-name', 'key:weight'],
  "font-stretch": ['static', 'arbitrary', 'bracketless-arbitrary'],
  "forced-color-adjust": ['static'],
  "from": ['static', 'arbitrary', 'bracketless-arbitrary', '--color-*', 'bracketless-arbitrary'],
  "gap": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "gap-x": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "gap-y": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "grayscale": ['paramless', 'arbitrary', 'bracketless-arbitrary'],
  "grid": [],
  "grid-cols": ['static', 'arbitrary', 'bracketless-arbitrary'],
  "grid-flow": ['static', 'arbitrary'],
  "grid-rows": ['static', 'arbitrary', 'bracketless-arbitrary'],
  "grow": ['paramless', 'arbitrary', 'bracketless-arbitrary'],
  "h": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "hidden": [],
  "hue-rotate": ['arbitrary', 'bracketless-arbitrary'],
  "hyphens": ['static'],
  "indent": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "inline": [],
  "inline-block": [],
  "inline-flex": [],
  "inline-grid": [],
  "inline-table": [],
  "inset": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "inset-ring": ['paramless', 'bracketless-arbitrary', 'arbitrary', '--color-*', 'static', 'arbitrary-modifier'],
  "inset-shadow": ['--inset-shadow-*', 'arbitrary'],
  "inset-x": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "inset-y": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "invert": ['paramless', 'arbitrary', 'bracketless-arbitrary'],
  "invisible": [],
  "isolate": [],
  "isolation-auto": [],
  "italic": [],
  "items": ['static'],
  "justify": ['static'],
  "leading": ['static', 'arbitrary', 'bracketless-arbitrary', '--leading-*', '--spacing-*'],
  "left": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "line-clamp": ['static', 'arbitrary', 'bracketless-arbitrary'],
  "line-through": [],
  "lining-nums": [],
  "list": ['static', 'arbitrary'],
  "lowercase": [],
  "m": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "mask": ['static', 'arbitrary'],
  "mask-b-from": ['bracketless-arbitrary', 'arbitrary', '--color-*'],
  "mask-b-to": ['bracketless-arbitrary', 'arbitrary', '--color-*'],
  "mask-clip": ['static'],
  "mask-conic": ['bracketless-arbitrary', 'arbitrary'],
  "mask-conic-from": ['bracketless-arbitrary', 'arbitrary', '--color-*'],
  "mask-conic-to": ['bracketless-arbitrary', 'arbitrary', '--color-*'],
  "mask-l-from": ['bracketless-arbitrary', 'arbitrary', '--color-*'],
  "mask-l-to": ['bracketless-arbitrary', 'arbitrary', '--color-*'],
  "mask-linear": ['bracketless-arbitrary', 'arbitrary'],
  "mask-linear-from": ['bracketless-arbitrary', 'arbitrary', '--color-*'],
  "mask-linear-to": ['bracketless-arbitrary', 'arbitrary', '--color-*'],
  "mask-origin": ['static'],
  "mask-r-from": ['bracketless-arbitrary', 'arbitrary', '--color-*'],
  "mask-r-to": ['bracketless-arbitrary', 'arbitrary', '--color-*'],
  "mask-radial": ['bracketless-arbitrary', 'arbitrary'],
  "mask-radial-from": ['bracketless-arbitrary', 'arbitrary', '--color-*'],
  "mask-radial-to": ['bracketless-arbitrary', 'arbitrary', '--color-*'],
  "mask-repeat": ['static'],
  "mask-t-from": ['bracketless-arbitrary', 'arbitrary', '--color-*'],
  "mask-t-to": ['bracketless-arbitrary', 'arbitrary', '--color-*'],
  "mask-x-from": ['bracketless-arbitrary', 'arbitrary', '--color-*'],
  "mask-x-to": ['bracketless-arbitrary', 'arbitrary', '--color-*'],
  "mask-y-from": ['bracketless-arbitrary', 'arbitrary', '--color-*'],
  "mask-y-to": ['bracketless-arbitrary', 'arbitrary', '--color-*'],
  "max-h": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "max-w": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*', '--container-*'],
  "mb": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "me": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "min-h": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "min-w": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*', '--container-*'],
  "mix-blend": ['static'],
  "ml": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "mr": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "ms": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "mt": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "mx": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "my": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "no-underline": [],
  "normal-case": [],
  "normal-nums": [],
  "not-italic": [],
  "not-sr-only": [],
  "object": ['static', 'arbitrary'],
  "oldstyle-nums": [],
  "opacity": ['arbitrary', 'bracketless-arbitrary'],
  "order": ['arbitrary', 'bracketless-arbitrary', 'static'],
  "ordinal": [],
  "origin": ['static', 'arbitrary'],
  "outline": ["paramless", 'arbitrary', "bracketless-arbitrary", 'static', '--color-*', 'key:length'],
  "overflow": ['static'],
  "overflow-x": ['static'],
  "overflow-y": ['static'],
  "overline": [],
  "overscroll": ['static'],
  "overscroll-x": ['static'],
  "overscroll-y": ['static'],
  "p": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "pb": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "pe": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "perspective": ['static', 'arbitrary'],
  "perspective-origin": ['static', 'arbitrary'],
  "pl": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "place-content": ['static'],
  "place-items": ['static'],
  "place-self": ['static'],
  "placeholder": ['--color-*', 'arbitrary'],
  "pointer-events": ['static'],
  "pr": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "proportional-nums": [],
  "ps": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "pt": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "px": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "py": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "relative": [],
  "resize": ['static', 'paramless'],
  "right": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "ring": ['paramless', 'arbitrary', 'bracketless-arbitrary', '--color-*'],
  "ring-offset": ['arbitrary', 'bracketless-arbitrary', '--color-*'],
  "rotate": ['static', 'arbitrary', 'bracketless-arbitrary'],
  "rotate-x": ['static', 'arbitrary', 'bracketless-arbitrary'],
  "rotate-y": ['static', 'arbitrary', 'bracketless-arbitrary'],
  "rotate-z": ['static', 'arbitrary', 'bracketless-arbitrary'],
  "rounded": ['static', 'arbitrary', '--radius-*'],
  "rounded-b": ['static', 'arbitrary', '--radius-*'],
  "rounded-bl": ['static', 'arbitrary', '--radius-*'],
  "rounded-br": ['static', 'arbitrary', '--radius-*'],
  "rounded-e": ['static', 'arbitrary', '--radius-*'],
  "rounded-ee": ['static', 'arbitrary', '--radius-*'],
  "rounded-es": ['static', 'arbitrary', '--radius-*'],
  "rounded-l": ['static', 'arbitrary', '--radius-*'],
  "rounded-r": ['static', 'arbitrary', '--radius-*'],
  "rounded-s": ['static', 'arbitrary', '--radius-*'],
  "rounded-se": ['static', 'arbitrary', '--radius-*'],
  "rounded-ss": ['static', 'arbitrary', '--radius-*'],
  "rounded-t": ['static', 'arbitrary', '--radius-*'],
  "rounded-tl": ['static', 'arbitrary', '--radius-*'],
  "rounded-tr": ['static', 'arbitrary', '--radius-*'],
  "row-auto": [],
  "row-end": ['static', 'bracketless-arbitrary', 'arbitrary'],
  "row-span": ['static', 'bracketless-arbitrary', 'arbitrary'],
  "row-start": ['static', 'bracketless-arbitrary', 'arbitrary'],
  "saturate": ['arbitrary', 'bracketless-arbitrary'],
  "scale": ['static', 'arbitrary', 'bracketless-arbitrary'],
  "scale-x": ['static', 'arbitrary', 'bracketless-arbitrary'],
  "scale-y": ['static', 'arbitrary', 'bracketless-arbitrary'],
  "scale-z": ['static', 'arbitrary', 'bracketless-arbitrary'],
  "scheme": ['static'],
  "scroll": ['static'],
  "scroll-m": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "scroll-mb": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "scroll-me": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "scroll-ml": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "scroll-mr": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "scroll-ms": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "scroll-mt": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "scroll-mx": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "scroll-my": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "scroll-p": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "scroll-pb": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "scroll-pe": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "scroll-pl": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "scroll-pr": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "scroll-ps": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "scroll-pt": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "scroll-px": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "scroll-py": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "select": ['static'],
  "self": ['static'],
  "sepia": ['paramless', 'arbitrary', 'bracketless-arbitrary'],
  "shadow": ['paramless', 'arbitrary', '--shadow-*', '--color-*', 'key:color'],
  "shrink": ['paramless', 'arbitrary', 'bracketless-arbitrary'],
  "size": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "skew": ['arbitrary', 'bracketless-arbitrary'],
  "skew-x": ['arbitrary', 'bracketless-arbitrary'],
  "skew-y": ['arbitrary', 'bracketless-arbitrary'],
  "slashed-zero": [],
  "snap": ['static'],
  "space-x": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "space-y": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "sr-only": [],
  "stacked-fractions": [],
  "start": ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  "static": [],
  "sticky": [],
  "stroke": ['static', 'arbitrary', '--color-*', 'bracketless-arbitrary', 'key:length'],
  "subpixel-antialiased": [],
  "table": ['paramless', 'static'],
  'tabular-nums': ['--color-*', '--text-*', 'static', 'arbitrary'],
  'text': ['static', 'arbitrary', '--color-*', '--text-*', 'key:length', '/--leading-*'],
  'text-shadow': ['static', 'arbitrary', '--color-*', '--shadow-*', 'key:color'],
  'to': ['--color-*', 'static', 'arbitrary', 'bracketless-arbitrary'],
  'top': ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  'touch': ['static'],
  'tracking': ['static', 'arbitrary', '--tracking-*'],
  'transform': ['paramless', 'arbitrary', 'static'],
  'transition': ['paramless', 'arbitrary', 'static'],
  'translate': ['--spacing-*', 'arbitrary', 'bracketless-arbitrary', 'static'],
  'translate-x': ['--spacing-*', 'arbitrary', 'bracketless-arbitrary', 'static'],
  'translate-y': ['--spacing-*', 'arbitrary', 'bracketless-arbitrary', 'static'],
  'translate-z': ['--spacing-*', 'arbitrary', 'bracketless-arbitrary', 'static'],
  'truncate': [],
  'underline': [],
  'underline-offset': ['bracketless-arbitrary', 'arbitrary', 'static'],
  'uppercase': [],
  'via': ['bracketless-arbitrary', 'arbitrary', '--color-*', 'static'],
  'visible': [],
  'w': ['static', 'arbitrary', 'bracketless-arbitrary', '--spacing-*'],
  'whitespace': ['static'],
  'will-change': ['static', 'arbitrary'],
  'wrap': ['static'],
  'z': ['static', 'arbitrary', 'bracketless-arbitrary'],
} satisfies DefaultUtility



// TODO:
// - get keyed arbitrary params from tailwind docs.
// - get modifier types



// -- Parsing -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 

// This type is concerned about the type of the currently parsed utility. Not the abstract concept of utility.

export type Utility3 = {
  full: string,
}

export type Utility2 = {
  full: string,
  type:
  | "full arbitrary utility"
  | "default arbitrary utility"
  | "default themed or staticparam utility"
  | "default bracketless arbitrary utility"
  | "default utility"
  | "custom utility"
  prefix: string,
  param?: string,
  modifier?: string,
  isAbitrary?: boolean,
  isNegative?: boolean,
  valueTypes?: string[],
  modifierTypes?: string[] | 'arbitrary' | 'bracketless-arbitrary',
}

export function parseUtility(utility: string) {
  const full = utility
  let { base, getModifier } = extractModifier2(full)
  const modifier = getModifier()

  const isArbitrary = base.startsWith('[') && base.endsWith(']')
  if (isArbitrary)
    return {
      full, modifier,
      type: "full arbitrary utility",
      prefix: base,
      isNegative: false,
      arbitrary: {
        full,
        cssVarUsed: analyzeArbitrary(full).cssVarUsed,
      },
    } as const

  // check isnegative when actual default utility is found
  const isNegative = base.startsWith('-')
  if (isNegative) base = base.slice(1)

  // Below this point: check for default utility.
  const sortedDefaultUtilities = Object.keys(defaultUtilities).sort((a, b) => {
    if (a.length === b.length) return b.localeCompare(a)
    return b.length - a.length
  }) as Array<keyof typeof defaultUtilities>

  const found = sortedDefaultUtilities.find(key => base.startsWith(key + '-'))
  if (found) {
    const param = base.slice(found.length + 1) // Found: "bg", Param: "red-500"
    const modifierType = defaultUtilities[found].filter(pt => pt.startsWith('/')).map(e => e.slice(1)) as ThemedTokenTypeString[] // modifierType: "/--color-*"
    const modifier = getModifier(modifierType)

    if (param.startsWith('[') && param.endsWith(']'))
      return {
        full, isNegative, modifier,
        type: "default arbitrary utility",
        prefix: found,
        param: param as `[${ string }]`,
        arbitrary: {
          full: param,
          cssVarUsed: analyzeArbitrary(param).cssVarUsed,
        },
      } as const

    if (param.startsWith('(') && param.endsWith(')')) {
      return {
        full, modifier, isNegative,
        type: "default arbitrary utility",
        prefix: found,
        param: param as `(${ string })`,
        arbitrary: {
          full: param,
          cssVarUsed: analyzeArbitrary(param).cssVarUsed,
        }
      } as const
    }
    // if param starts with number.
    if (param.length > 0 && !isNaN(Number(param[0]))) {
      return {
        full, modifier, isNegative,
        type: "default bracketless arbitrary utility",
        prefix: found,
        param,
      } as const
    }
    const utilityTypes = defaultUtilities[found].filter(pt => pt.startsWith('--')) as ThemedTokenTypeString[] // only pass valueTypes when paramed is found?
    if (utilityTypes.length > 0) {
      return {
        full, modifier, isNegative,
        type: "default defined param utility",
        prefix: found,
        param,
        valueTypes: utilityTypes,
      } as const
    }
    return {
      full, isNegative,
      type: "default utility",
      prefix: found,
    } as const
  }

  const staticUtilFound = sortedDefaultUtilities.filter(u => (defaultUtilities as DefaultUtility)[u].includes('static')).find(key => base.startsWith(key))
  if (staticUtilFound) {
    return {
      full, isNegative,
      type: "default utility",
      prefix: found,
    } as const
  }
  return {
    full, modifier,
    type: "custom utility",
    prefix: base,
  } as const
}


export type UnresolvedCustomUtilityUsed = NonNullable<ReturnType<typeof parseUtility>> extends infer A
  ? A extends { type: "custom utility" }
  ? A
  : never
  : never

export type UtilityUsed = NonNullable<ReturnType<typeof parseUtility>>




export function parseUtilityWithKnownUtilities(utility: string, utilityName: string) {
  const full = utility
  let { base, getModifier } = extractModifier2(full)
  const modifier = getModifier()
  const type = utilityName.includes('-*') ? 'dynamic' as const : 'static' as const
  if (type === "static") {
    const prefix = utilityName
    return {
      full, modifier,
      type: "custom static utility",
      prefix,
      // param,
    } as const
  }
  else { // type === "dynamic"
    const prefix = utilityName.split('-*')[0]
    const param = base.slice(prefix.length + 1)
    if ((param.startsWith('[') && param.endsWith(']')) || (param.startsWith('(') && param.endsWith(')'))) {
      return {
        full, modifier,
        type: "custom dynamic arbitrary utility",
        prefix,
        param,
        arbitrary: {
          full: param,
          cssVarUsed: analyzeArbitrary(param).cssVarUsed,
        },
      } as const
    }
    return {
      full, modifier,
      type: "custom dynamic utility",
      prefix,
      param,
    } as const
  }
}
