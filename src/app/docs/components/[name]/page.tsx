import { CodeBlock } from "@/lib/components/codeblock";
import { parse } from "@babel/parser";
import traverse, { type Node } from "@babel/traverse";
import { readFile } from "fs/promises";
import postcss from "postcss";
import { type JSX } from "react";
import { CardTitleHintBoxThing, ComponentExampleItem, PreviewCard } from "./client";

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

    const examples = await getExamples(rawCode, ComponentSource['Examples'] ?? undefined)

    const simpleExamples = examples?.filter(i => !i.advanced)
    const advancedExamples = examples?.filter(i => i.advanced)

    return (
      <>
        <h1>{name}</h1>
        <p>{description}</p>

        {preview && <PreviewCard className="border py-20 my-4">
          {preview}
        </PreviewCard>}

        {!!simpleExamples?.length && <>
          <h2 className="muted">
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


        {sourceCode && <h2 className="muted">
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
              <pre className="grid border-t-0!">
                {customTokensUsed.map(i => (
                  <div key={i.name} className="grid grid-cols-2">
                    <span className="text-xs text-muted-foreground font-mono">
                      --{i.type}-{i.name}:
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {i.value}
                    </span>
                  </div>
                ))}
              </pre>
            </>
          }
        </div>

        {!!advancedExamples?.length && <>
          <h2 className="muted">
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
    .filter(i => i && !/[\[\]\(\)]/.test(i)) // filter out bracketed classes
    .filter((item, index, arr) => arr.indexOf(item) === index) // filter duplicates
    .map(i => i as string)
  const customTokensUsed = Array.from(customTokenMap)
    .map(i => {
      const [value, type, name] = i[0].match(/--([a-z]+)-([a-z-]+)$/) ?? [null, null]
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

export type ComponentExamplesEntries = {
  name: string,
  description?: string,
  jsx: JSX.Element,
  advanced?: boolean,
  sourceCode?: string,
  external?: string,
}[]

async function getExamples(fullSourceCode: string | undefined, _componentExamples?: ComponentExamplesEntries) {
  const ComponentExamples = _componentExamples ?? []
  try {
    if (!fullSourceCode || !ComponentExamples || ComponentExamples.length === 0) return
  } catch (error) {
    console.error(error)
    return
  }
  const examples: {
    name: string,
    description?: string,
    jsx: JSX.Element,
    advanced?: boolean,
    sourceCode?: string,
  }[] = []
  for (const ex of ComponentExamples) {
    const exampleSourceCode = await (async () => {
      if (!ex.external) {
        return fullSourceCode.split('// </Preview=' + ex.name + '>')[0]?.split('// <Preview=' + ex.name + '>')[1] ?? null
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
      const firstNonEmptyIndex = lines.findIndex(line => !/^\s*$/.test(line))
      // check how many leading spaces are in the first line
      const trimmedLeadingEmpty = lines.slice(firstNonEmptyIndex)
      const leadingSpaces = trimmedLeadingEmpty[0].match(/^\s+/)?.[0]?.length ?? 0
      // remove leading spaces from all lines
      return lines.map(line => line.slice(leadingSpaces)).join('\n')
    })()

    examples.push({
      ...ex,
      sourceCode: trimmedExampleSourceCode
    })
  }
  return examples
}