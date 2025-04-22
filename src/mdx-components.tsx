import type { MDXComponents } from 'mdx/types'
import { CodeBlock } from './lib/components/codeblock'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    "pre": (props) => {
      // console.log(props)
      return (
        <CodeBlock code={String(props.children.props.children)} lang={'tsx'} />
      )
    },
    ...components,
  }
}