import { cn } from "lazy-cn";
import type { ComponentProps } from "react";
import { codeToTokens, type BundledLanguage } from "shiki";
import { CopyCodeButton } from "./codeblock.client";

export async function CodeBlock(props: ComponentProps<"div"> & {
  code: string;
  lang: BundledLanguage;
}) {
  const { code, lang, ...preProps } = props
  const tokens = await codeToTokens(props.code, {
    lang: props.lang,
    theme: "vesper",
    includeExplanation: "scopeName"
  })
  return (
    <div {...preProps} className={cn(
      "relative group border-x border-current/10",
      preProps.className
    )}>
      <CopyCodeButton data={code} />
      <div className="px-4 overflow-auto">
        <pre className={cn("border-none! px-4 overflow-visible! w-fit -mx-4",)}>
          {tokens.tokens.map((line, i) => (
            <div key={i}>
              {line.map((token, j) => (
                <span key={j} className={token.color}
                  style={{
                    color: (() => {
                      if (token.color === "#D32F2F") return "#B53D59"
                      if (token.color === "#6F42C1") return "#6C4FD7"
                      if (token.color === "#1976D2") return "#304CC4"
                      if (token.color === "#24292EFF") return "#212938"
                      if (token.color === "#22863A") return "#35794D"

                      return token.color
                    })(),
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
      </div>
    </div>
  )
}

