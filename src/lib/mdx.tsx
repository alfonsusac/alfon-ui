import { readdir, readFile } from "fs/promises"
import type { ReactNode } from "react"
import { CodeBlock } from "./components/codeblock"

export function getArticle(imported: any) {

  if ('tags' in imported === false || Array.isArray(imported.tags) === false) {
    throw new Error('Invalid article tags metadata')
  }

  return imported as {
    default: ReactNode,
    tags: string[]
  }
}

export async function ComponentFile(props: {
  path: string
}) {
  try {
    const content = await readFile(props.path, { encoding: "utf-8" })
    // return `\`\`\`\n${ content }\n\`\`\``
    return (
      <CodeBlock code={content} lang={"tsx"} />
    )
  } catch (error) {
    const curr = await readdir('.')
    console.error(String(error) + curr)
  }
}