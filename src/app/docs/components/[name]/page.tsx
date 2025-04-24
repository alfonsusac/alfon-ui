import { CodeBlock } from "@/lib/components/codeblock";
import { parse } from "@babel/parser";
import traverse, { type Node } from "@babel/traverse";
import { readFile } from "fs/promises";
import postcss from "postcss";
import { Fragment, type JSX } from "react";
import { CardTitleHintBoxThing, ComponentExampleItem, PreviewCard } from "./client";
import Link from "next/link";

export function generateStaticParams() {
  return [
    {
      name: "button"
    }
  ]
}

export default async function DocsComponentsPage(props: {
  params: Promise<{ name: string[] }>
}) {
  const { name } = await props.params;
  try {
    const ComponentSource = await import(`@/lib/components/${ name }`)
    const description = ComponentSource['description']
    const preview = ComponentSource['Preview']

    const rawCode = await readFile(`./src/lib/components/${ name }.tsx`, { encoding: "utf-8" })
    const sourceCode = getSourceCode(rawCode)

    const dependencies = getDependencies(sourceCode)
    const customTokensUsed = await getCustomTokensUsed(sourceCode)
    const customUtilityUsed = await getUtilityTokenSourceCodeUsed(ComponentSource['utilityUsed'] ?? undefined)

    const examples = await getExamples(rawCode, ComponentSource['Examples'] ?? undefined)

    const simpleExamples = examples?.filter(i => !i.advanced)
    const advancedExamples = examples?.filter(i => i.advanced)

    return (
      <>
        <h1>{name}</h1>
        <p>{description}</p>

        <div className="my-4 border border-current/10 divide-y divide-current/10">
          {preview && <PreviewCard className="py-20">
            {preview}
          </PreviewCard>}
          <Link href="#variants" className="block text-xs p-2 bg-current/3 hover:bg-current/5 cursor-pointer">
            Variants
          </Link>
          <Link href="#source" className="block text-xs p-2 bg-current/3 hover:bg-current/5 cursor-pointer">
            Installation
          </Link>
          <Link href="#more-example" className="block text-xs p-2 bg-current/3 hover:bg-current/5 cursor-pointer">
            More Examples
          </Link>
        </div>

        {!!simpleExamples?.length && <>
          <h2 className="muted" id="variants">
            Variants
          </h2>
          <div className="flex flex-col gap-8 pb-8">
            {simpleExamples.map((i, index) => (
              <ComponentExampleItem
                key={index}
                name={i.name}
                description={i.description}
                jsx={i.jsx}
                sourceCode={i.sourceCode &&
                  <CodeBlock code={i.sourceCode} lang={"tsx"} className="border-none min-w-0" />
                }
              />
            ))}
          </div>
        </>}


        {sourceCode && <h2 className="muted" id="source">
          Source Code
        </h2>}


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
          {!!customTokensUsed?.length &&
            <>
              <CardTitleHintBoxThing className="border-y-0!">Design Token Used (global.css)</CardTitleHintBoxThing>
              <pre className="border-t-0! ">
                {'@theme inline {'}
                <div className="grid grid-cols-[max-content_1fr] pl-[2ch]">
                  {customTokensUsed.map(i => (
                    <Fragment key={i.name}>
                      <div className="text-xs text-muted-foreground font-mono">
                        --{i.type}-{i.name}:
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {i.value}
                      </div>
                    </Fragment>
                  ))}
                </div>
                {'}'}
                {customUtilityUsed?.map((u, i) => (<Fragment key={i}>
                  {'\n\n@utility ' + u.name + ' {'}
                  <div className="pl-[2ch]">
                    {u.content.split('\n').map((i, index) => (
                      <Fragment key={index}>
                        <div className="text-xs text-muted-foreground font-mono">
                          {i}
                        </div>
                      </Fragment>
                    ))}
                  </div>
                  {'}'}
                </Fragment>))}
              </pre>
            </>
          }
        </div>

        {!!advancedExamples?.length && <>
          <h2 className="muted" id="more-example">
            More Examples
          </h2>
          <div className="flex flex-col gap-8 pb-8">
            {advancedExamples.map((i, index) => (
              <ComponentExampleItem
                key={index}
                name={i.name}
                description={i.description}
                jsx={i.jsx}
                sourceCode={i.sourceCode && <CodeBlock code={i.sourceCode} lang={"tsx"} className="border-none" />}
              />
            ))}
          </div>
        </>}

      </>
    )
  } catch (error) {
    console.error(error)
    return <div>Component not found</div>
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

async function getCustomTokensUsed(sourceCode?: string) {
  if (!sourceCode) return
  const globalCssString = await readFile(`./src/app/globals.css`)
  const globalCss = postcss.parse(globalCssString)
  const customTokenMap = new Map<string, string>()
  globalCss.walkAtRules((rule) => {
    if (rule.name === 'theme') {
      rule.walkDecls((decl) => {
        if (decl.prop.startsWith('--')) {
          customTokenMap.set(decl.prop, decl.value)
        }
      })
    }
  })
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
  const tokensUsed = Array.from(tailwindClassSet)
    .map(i => {
      const bareClass = i.split(':').at(-1)?.replace(/\/\d+$/, '')
      return bareClass
    })
    .filter((item, index, arr) => arr.indexOf(item) === index) // filter duplicates
    .map(i => i as string)

  const customTokensUsed = Array.from(customTokenMap)
    .map(i => {
      const [value, type, name] = i[0].match(/--([a-z]+)-([a-z0-9-]+)$/) ?? [null, null]
      if (value === null || type === null || name === null)
        throw new Error("Invalid token name: " + i[0])
      return {
        type,
        name,
        value: i[1]
      }
    }).filter(i => {
      if (i.type === 'color') {
        return tokensUsed.some(j => j.includes(i.name))
      }
    })

  return customTokensUsed
}
async function getUtilityTokenSourceCodeUsed(utilityUsed?: string[]) {
  if (!utilityUsed) return
  if (!utilityUsed.length) return
  const sourceCodes: {
    name: string,
    content: string,
  }[] = []
  const globalCssString = await readFile(`./src/app/globals.css`, { encoding: "utf-8" })
  if (!globalCssString) return
  for (const utility of utilityUsed) {
    console.log('utility: ', utility)
    const rawCode = globalCssString
      .split(`/* ${ utility }-end */`)[0]
      .split(`@utility input-base {`)[1]
    if (rawCode) {
      sourceCodes.push({
        name: utility,
        content: rawCode
      })
    }
  }
  return sourceCodes
}

export type ComponentExamplesEntries = {
  name: string,
  description?: string,
  jsx: JSX.Element,
  advanced?: boolean | "inspiration",
  fullWidth?: string,
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
      console.log(firstNonEmptyIndex)
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