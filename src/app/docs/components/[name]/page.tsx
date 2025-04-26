import { CodeBlock } from "@/lib/components/codeblock";
import { parse } from "@babel/parser";
import traverse, { type Node } from "@babel/traverse";
import { readFile } from "fs/promises";
import postcss, { type AtRule } from "postcss";
import declValueParser from 'postcss-value-parser';
import { Fragment, type JSX } from "react";
import { CardTitleHintBoxThing, ComponentExampleItem, PreviewCard } from "./client";
import Link from "next/link";

export function generateStaticParams() {
  return [
    { name: "button" },
  ]
}

export default async function DocsComponentsPage(props: {
  params: Promise<{ name: string }>
}) {
  try {
    const { name } = await props.params;
    const ComponentSource = await import(`@/lib/components/${ name }`)
    const description = ComponentSource['description']
    const preview = ComponentSource['Preview']

    const rawCode = await readFile(`./src/lib/components/${ name }.tsx`, { encoding: "utf-8" })
    const sourceCode = getSourceCode(rawCode)

    const dependencies = getDependencies(sourceCode)
    const classNamesTokenUsedMap = await getClassNamesTokensUsedSet(sourceCode)
    // const customUtilityUsed = await getUtilityUsedSourceCode(ComponentSource['utilityUsed'] ?? undefined) ?? []
    // const tokensUsedInUtility = getTokensUsedInUtilitySourceCode(customUtilityUsed?.map(c => c.content).join('\n'))
    // const customTokensUsed = await getCustomTokensUsed(new Set([...classNamesTokenUsedMap ?? [], ...tokensUsedInUtility ?? []])) ?? []
    // const globalCSS = constructGlobalCss(customTokensUsed, customUtilityUsed)

    const css = await getGlobalCSS()
    // console.log(css)

    const examples = await getExamples(rawCode, ComponentSource['Examples'] ?? undefined)
    const simpleExamples = examples?.filter(i => !i.advanced) ?? []
    const advancedExamples = examples?.filter(i => i.advanced) ?? []

    return (
      <>
        <h1 className="asdf2-hello">{name}</h1>
        <p>{description}</p>

        <div className="my-4 border border-current/10 divide-y divide-current/10">
          {preview ? <PreviewCard className="py-20">{preview}</PreviewCard> : null}
          {[
            ["#variants", "Variants"],
            ["#source", "Installation"],
            ["#more-example", "More Examples"],
          ].map(([href, label]) =>
            <Link key={href} href={href} className="block text-xs p-2 bg-current/3 hover:bg-current/5 cursor-pointer">{label}</Link>
          )}
        </div>

        {!!simpleExamples.length && <>
          <h2 className="muted" id="variants">
            Features
          </h2>
          <div className="flex flex-col gap-8 pb-8">
            {simpleExamples.map(({ name, description, sourceCode, jsx }, index) => (
              <ComponentExampleItem
                key={index}
                name={name}
                description={description}
                jsx={jsx}
                sourceCode={sourceCode &&
                  <CodeBlock
                    code={sourceCode}
                    lang={"tsx"}
                    className="border-none min-w-0"
                  />}
              />
            ))}
          </div>
        </>}


        {sourceCode &&
          <h2 className="muted" id="source">
            Source Code
          </h2>
        }

        <div className="*:first:border-t! *:last:border-b! flex flex-col">
          {!!dependencies?.length &&
            <>
              <CardTitleHintBoxThing>Dependencies</CardTitleHintBoxThing>
              <CodeBlock code={`npm i ` + dependencies.map((i) => `${ i }`).join(' ')} lang={"shell"} className="border-y-0!" />
            </>
          }
          {sourceCode &&
            <>
              <CardTitleHintBoxThing className="border-y-0!">Source</CardTitleHintBoxThing>
              <CodeBlock code={sourceCode} lang={"tsx"} className="border-y-0!" />
            </>}
          {/* {!!customTokensUsed?.length &&
            <>
              <CardTitleHintBoxThing className="border-y-0!">Design Token Used (global.css)</CardTitleHintBoxThing>
              <CodeBlock code={globalCSS} lang={"sass"} />
            </>
          } */}
        </div>

        {!!advancedExamples.length && <>
          <h2 className="muted" id="more-example">
            More Examples
          </h2>
          <div className="flex flex-col gap-8 pb-8">
            {advancedExamples.map((i, index) => (
              <ComponentExampleItem
                key={index}
                {...i}
                sourceCode={i.sourceCode && <CodeBlock code={i.sourceCode} lang={"tsx"} className="border-none" />}
              />
            ))}
          </div>
        </>}

      </>
    )
  } catch (error) {
    console.error(error)
    return <pre>Component not found <br />{String(error)} <br />{String(error instanceof Error && error.stack)}</pre>
  }
}

// --- Data ------------------------------------------------------------------------

function getSourceCode(code?: string) {
  if (!code) return
  const sourceCode = code.split('// </Source>')[0].split('// <Source>\n')[1]
  return sourceCode
}
function getDependencies(sourceCode?: string) {
  if (!sourceCode) return
  const dependencies = sourceCode
    .split('\n')
    .filter(
      i => i.includes('import')
        && i.includes('"react"') === false
        && i.includes('"react-dom"') === false
    )
    .map(i => i.match(/from\s+["']([^"']+)["']/)?.[1])
    .filter(i => !i?.startsWith('@/'))
    .filter(i => !i?.startsWith('./'))
  return dependencies
}
async function getClassNamesTokensUsedSet(sourceCode?: string) {
  if (!sourceCode) return
  const ast = parse(sourceCode, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });
  const tailwindClassSet = new Set<string>();
  function extractStrings(node: Node | null | undefined): void {
    if (!node) return;
    switch (node.type) {
      case "StringLiteral":
        node.value.split(/\s+/).forEach(cls => tailwindClassSet.add(cls));
        break;
      case "ArrayExpression":
        for (const elem of node.elements) {
          if (elem && elem.type !== "SpreadElement") {
            extractStrings(elem);
          }
        }
        break;
      case "LogicalExpression":
        extractStrings(node.right);
        break;
      case "ConditionalExpression":
        extractStrings(node.consequent);
        extractStrings(node.alternate);
        break;
      default:
        break;
    }
  }
  traverse(ast, {
    CallExpression(path) {
      const callee = path.get("callee");
      if (callee.isIdentifier({ name: "cn" })) {
        path.node.arguments.forEach(extractStrings);
      }
    }
  });
  return tailwindClassSet
}
async function getGlobalCSS() {
  // const defaultTheme = await readFile(`./node_modules/tailwindcss/theme.css`, "utf-8")
  const globalCssString = await readFile(`./src/app/globals.css`, "utf-8")
  const parsedCss = postcss.parse(globalCssString)
  // const parsedCss = await postcss([require('@tailwindcss/postcss')]).process(globalCssString)
  // const parsedCss = postcss.parse([defaultTheme, globalCssString].join('\n'))

  const cssProps = new Map<string, {
    raw: string,
    variableUsed: `--${ string }`[],
  }>()

  const twUtilities = new Map<string, {
    parsed: AtRule,
    valueTypes: `--${ string }-*`[],
    modifierTypes: `--${ string }-*`[],
    appliedClassNames?: string[],
    variants?: string[],
    cssProps?: `--${ string }`[],
  }>()

  parsedCss.walkAtRules(rule => {
    if (rule.name === 'theme') {
      rule.walkDecls(d => {
        if (!d.variable) return;
        const variableUsed = new Set<`--${ string }`>()
        declValueParser(d.value).walk(v => {
          if (v.type === "function" && v.value === "var")
            variableUsed.add(v.nodes[0].value as `--${ string }`)
        })
        cssProps.set(d.prop, {
          raw: d.value,
          variableUsed: [...variableUsed],
        })
      })
      rule.walkAtRules(r => { if (r.name === 'keyframes') console.warn("@keyframe rule found in @theme") })
    }
    if (rule.name === 'utility') {

      // Get @apply
      const appliedClassNames = new Set<string>()
      const variants = new Set<string>()
      rule.walkAtRules(r => {
        if (r.name === "apply") r.params.split(/\s+/).forEach(u => appliedClassNames.add(u))
        if (r.name === "variant") variants.add(r.params)
      })

      // Get --value() and --modifier()
      const valueTypes = new Set<`--${ string }-*`>()
      const modifierTypes = new Set<`--${ string }-*`>()
      const cssProps = new Set<`--${string}`>()
      rule.walkDecls(d => {
        declValueParser(d.value).walk(v => {
          if (v.type === "function") {
            if (v.value === "--value") {
              v.nodes.filter(v => v.type === "word").forEach(v => valueTypes.add(v.value as `--${ string }-*`))
            }
            if (v.value === "--modifier") {
              v.nodes.filter(v => v.type === "word").forEach(v => modifierTypes.add(v.value as `--${ string }-*`))
            }
            if (v.value === "var") {
              
            }
          }
        })



        const getTokenTypeUsedInFunctionCallArguments = (declValue: string, fname: string) => {
          const tokenTypeUsed = new Set<`--${ string }-*`>()
          declValueParser(declValue).walk(v => {
            if (v.type === "function" && v.value === `${ fname }`)
              v.nodes
                .filter(v => v.type === "word")
                .forEach(v => tokenTypeUsed.add(v.value as `--${ string }-*`))
          })
          return [...tokenTypeUsed]
        }
        getTokenTypeUsedInFunctionCallArguments(d.value, '--value')
          .forEach(t => valueTypes.add(t))
        getTokenTypeUsedInFunctionCallArguments(d.value, '--modifier')
          .forEach(t => modifierTypes.add(t))

      })
      twUtilities.set(rule.params, {
        parsed: rule,
        valueTypes: [...valueTypes],
        modifierTypes: [...modifierTypes],
        appliedClassNames: [...appliedClassNames],
        variants: [...variants],
      })
    }
  })

  // console.log(twUtilities)
  // cssProps
  const defaultTokenType = [
    'animate', 'blur', 'breakpoint', 'color', 'container',
    'drop-shadow', 'ease', 'font', 'inset-shadow', 'leading',
    'radius', 'shadow', 'spacing', 'text', 'tracking'
  ]

  // Stuff found in @custom-variant
  // - can contain declaration using var from _@theme_
  // - cannot contain value from @apply (it will be removed)

  // @apply    [custom-variant]:(utility)(value)/(modifier)
  // - can contain variants in _@custom-variant_ or default variants
  // - can contain utility in _@utility_ or default utilities
  // - can contain values from _@theme_ or utility's default themes
  // - can contain modifier from _@theme_ or utility's default modifiers

  // Stuff found in @theme
  // - can contain values refering to itself using var()
  // - can contain value types from default themes (--color, --font, --spacing)
  // - can contain value types from _@utility_ (--value(--tab-*))
  // - can contain modifier types from _@utility_

  // Stuff found in @utility
  // - can contain values from _@apply_ but not its own utility
  // - can contain declaration using var from _@theme_
  // - can contain custom value types from _@theme_
  // - can contain custom modifier types from _@theme_










  return { parsedCss }
}

async function getCustomTokensUsed(tokensStringSet?: Set<string>) {
  if (!tokensStringSet) return
  // tokenStringSet doesn't need to be fancy. It could be just:
  // bg-primary
  // text-[var(--color-background)]

  type tailwindCSSProp = { type: string, name: string, value: string }

  // Extracts css rules inside `@theme inline`
  // into Map<--props, value>
  const globalCssString = await readFile(`./src/app/globals.css`)
  const globalCss = postcss.parse(globalCssString)
  const customCSSPropertyTokensMap = new Map<string, string>()
  globalCss.walkAtRules((rule) => {
    if (rule.name === 'theme') {
      rule.walkDecls((decl) => {
        if (decl.prop.startsWith('--')) {
          customCSSPropertyTokensMap.set(decl.prop, decl.value)
        }
      })
    }
  })

  // Extract the utility classnames from 
  // hover:bg-[var(--color-primary)] -> bg-[var(--color-primary)]
  const classNameTokensUsed = Array.from(tokensStringSet)
    .map(i => i.split(':').at(-1)?.replace(/\/\d+$/, ''))
    .filter((item, index, arr) => arr.indexOf(item) === index) // filter duplicates
    .map(i => i as string)

  const customCSSPropertyTokensGraph = new Map<string, string[]>()
  customCSSPropertyTokensMap.forEach((val, key) => {
    customCSSPropertyTokensGraph.set(
      key,
      [...val.matchAll(/\((--[a-z0-9-]+)\)/gi)].map(val => val[1])
    )
  })

  // For each custom css property tokens, match it with classNameTokensUsed.
  // See if "--color-primary" exists in "bg-[var(--color-primary)] text-background" 
  const customTokensUsedMap = new Map<string, { type?: string, name?: string, value?: string }>()

  for (const [cssPropKey, cssPropValue] of [...customCSSPropertyTokensMap]) {
    const [value, type, name] = cssPropKey.match(/--([a-z]+)-([a-z0-9-]+)$/) ?? [null, null]
    if (value === null || type === null || name === null) {
      console.log('invalid css prop name: ', cssPropKey)
      continue
    }
    const isUsed = classNameTokensUsed.some(j => j.includes(cssPropKey))


  }

  Array.from(customCSSPropertyTokensMap)
    .map(i => {
      const [value, type, name] = i[0].match(/--([a-z]+)-([a-z0-9-]+)$/) ?? [null, null]
      if (value === null || type === null || name === null) throw new Error("Invalid token name: " + i[0])
      return { type, name, value: i[1] }
    }).filter(i => {
      if (i.type === 'color') {
        // Later: filter className based on utility supported values
        // i.e only check against bg-* and text-* and (--color-*) vars
        const isUsed = classNameTokensUsed.some(j => j.includes(i.name))
      }
      // Later: Add more types here if more token types are used (for now just --color-*)
    })

  return customTokensUsedMap
}
function constructGlobalCss(
  customTokensUsed: {
    type: string;
    name: string;
    value: string;
  }[],
  customUtilitiesUsed: {
    name: string;
    content: string;
  }[]
) {
  let result = '@import "tailwindcss";\n\n'
  if (customTokensUsed.length) {
    result += '@theme inline {\n'
    const maxTokenNameWidth = customTokensUsed.reduce((prev, curr) => (curr.name.length > prev) ? (curr.name.length) : (prev), 0) + 1
    result += customTokensUsed
      .map(t => `  --${ t.type }-${ (t.name + ':').padEnd(maxTokenNameWidth) } ${ t.value };\n`)
      .join('')
    result += '}\n'
  }
  if (customUtilitiesUsed.length) {
    result += '\n'
    result += customUtilitiesUsed
      .map(u => `@utility ${ u.name } {\n${ u.content.replace(/^\n/g, '') }\n}\n`)
  }
  return result
}


async function getUtilityUsedSourceCode(utilityUsed?: string[]) {
  if (!utilityUsed || !utilityUsed.length) return
  const sourceCodes: {
    name: string,
    content: string,
  }[] = []
  const globalCssString = await readFile(`./src/app/globals.css`, { encoding: "utf-8" })
  if (!globalCssString) return
  for (const utility of utilityUsed) {
    const rawCode = globalCssString
      .split(new RegExp(`^@utility ${ utility } {`, 'm'))[1]
      .split(/^}/m)[0]

    if (rawCode) {
      sourceCodes.push({
        name: utility,
        content: rawCode
      })
    }
  }

  // console.log('utility: ', sourceCodes)
  return sourceCodes
}

function getTokensUsedInUtilitySourceCode(rawCode?: string) {
  if (!rawCode) return
  const propertiesUsed = new Set<string>();
  Array.from(rawCode.matchAll(/\(--[a-z0-9-]+\)/gi)).forEach(e => {
    propertiesUsed.add(e[0])
  })
  return propertiesUsed
}


export type ComponentExamplesEntries = {
  name: string,
  description?: string,
  jsx: JSX.Element,
  advanced?: boolean | "inspiration",
  fullWidth?: boolean,
  sourceCode?: string,
  external?: string,
}[]

async function getExamples(fullSourceCode: string | undefined, componentExamples?: ComponentExamplesEntries) {
  try {
    if (!fullSourceCode || !componentExamples || componentExamples.length === 0) return
  } catch (error) {
    console.error(error)
    return
  }
  const examples: ComponentExamplesEntries = []
  for (const ex of componentExamples) {
    const exampleSourceCode = await (async () => {
      if (!ex.external) {
        return fullSourceCode
          .split('// </Preview=' + ex.name + '>')[0]
          ?.split('// <Preview=' + ex.name + '>')[1]
          ?? fullSourceCode
            .split('{/* End Preview=' + ex.name + ' */}')[0]
            ?.split('{/* Preview=' + ex.name + ' */}')[1]
      } else {
        const externalSourceCode = await readFile(ex.external, { encoding: "utf-8" })
        return externalSourceCode.split('// </Source>')[0]?.split('// <Source>')[1] ?? null
      }
    })()
    // const exampleSourceCode = fullSourceCode.split('// </Preview=' + ex.name + '>')[0]?.split('// <Preview=' + ex.name + '>')[1] ?? null
    if (exampleSourceCode === null && !ex.external) {
      console.warn(`No example source code found for example: ${ ex.name }`)
      continue
    }

    const trimmedExampleSourceCode = (() => {
      // remove leading empty lines
      const lines = exampleSourceCode.split('\n')
      const firstNonEmptyIndex = lines.findIndex(line => /^\s*$/.test(line))
      // check how many leading spaces are in the first line
      const trimmedLeadingEmpty = lines.slice(firstNonEmptyIndex + 1)
      const leadingSpaces = trimmedLeadingEmpty[0].match(/^\s+/)?.[0]?.length ?? 0
      // remove leading spaces from all lines
      return trimmedLeadingEmpty.map(line => line.slice(leadingSpaces)).join('\n')
    })()

    examples.push({
      ...ex,
      sourceCode: trimmedExampleSourceCode
    })
  }
  return examples
}

// --- Components ------------------------------------------------------------------------
