import { cn } from "lazy-cn";
import type { ComponentProps } from "react";
import { codeToTokens, type BundledLanguage } from "shiki";
import { CopyCodeButton } from "./codeblock.client";

export async function CodeBlock(props: ComponentProps<"pre"> & {
  code: string;
  lang: BundledLanguage;
}) {
  const { code, lang, ...preProps} = props
  const tokens = await codeToTokens(props.code, {
    lang: props.lang,
    theme: "min-light",
  })
  return (
    <pre {...preProps} className={cn("relative group", preProps.className)}>
      <CopyCodeButton data={code}  />
      {tokens.tokens.map((line, i) => (
        <div key={i}>
          {line.map((token, j) => (
            <span
              key={j}
              style={{
                color: token.color,
                backgroundColor: token.bgColor,
              }}
            >
              {token.content}
            </span>
          ))}
          {line.length === 0 && (i !== tokens.tokens.length - 1) && (
            <span> </span>
          )}
        </div>
      ))}
    </pre>
  )
}

