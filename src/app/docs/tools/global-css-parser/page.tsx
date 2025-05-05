// import { resolveCustomVariants } from "@/lib/tw/resolve-dependencies";
import { parseTailwindCSS } from "@/lib/tw/twcss/parse-css";
import { getGlobalCSSDependencyList } from "@/lib/tw/twcss/parse-globalcss";
import { resolveVariableDeclarations } from "@/lib/tw/twcss/resolve-var";
import { readFile } from "fs/promises";
import { Fragment } from "react";
import { codeToHtml } from "shiki";

export default async function GlobalCssParserPage() {

  const defaultglobalcss = await readFile('./node_modules/tailwindcss/theme.css', 'utf-8')
  const globalcss = await readFile('./src/app/globals.css', 'utf-8')
  const parsedCss = parseTailwindCSS(defaultglobalcss + '\n' + globalcss)
  // const resolvedCssVar = resolveVariableDeclarations(parsedCss.variableDeclarations)
  // const resolbedCustomVariant = resolveCustomVariants(parsedCss.atCustomVariants, resolvedCssVar)

  const html = await codeToHtml(JSON.stringify(parsedCss, null, 2), {
    lang: "json",
    theme: "min-light",
  })

  return (
    <div className="tracking-tighter">
      <header className="mb-8">
        <h1>Tailwind Global CSS Parser</h1>
      </header>

      <h2 className="text-2xl!">Resolved</h2>
      <h3 className="mt-8! mb-4!">Variable Declarations</h3>



      <h2 className="text-2xl!">Raw</h2>

      <h3 className="mt-8! mb-4!">Custom Utilities</h3>
      <div className="flex flex-col card p-6 gap-5 leading-3 text-nowrap overflow-auto  text-[0.8em]">
        {Object.values(parsedCss.atUtilities).map((v, i) => {
          return (
            <div className="" key={i}>
              <div className="text-sm font-semibold">{v.name} {v.type === "dynamic" && <span className="font-normal">(dynamic)</span>}</div>
              {
                v.type === "dynamic" && <>
                  <div className="text-blue-700 flex flex-wrap gap-x-4 leading-4">
                    {v.themedValueTypes.length
                      ? <>{v.themedModifierTypes.map(i => <div key={i}>{`value(${ i })`}</div>)}</>
                      : <div className="text-blue-700/25">No Modifier Types</div>
                    }
                  </div>
                  <div className="text-blue-700 flex flex-wrap gap-x-2 leading-4">
                    {v.themedModifierTypes.length
                      ? <>{v.themedModifierTypes.map(i => <div key={i}>{`modifier(${ i })`}</div>)}</>
                      : <div className="text-blue-700/25">No Modifier Types</div>
                    }
                  </div>
                </>
              }
              <div className="text-amber-600 flex flex-wrap gap-x-2 leading-4">
                {v.cssVarsUsed.length
                  ? v.cssVarsUsed.map(i => <div key={i}>var({i})</div>)
                  : <div className="text-amber-600/25">No CSS Variables</div>}
              </div>
              <div className="text-green-700 flex flex-wrap gap-x-2 leading-4">
                {v.classNamesUsed.length
                  ? v.classNamesUsed.map(i => <div key={i}>{`${ i }`}</div>)
                  : <div className="text-green-700/25">No Class Names</div>
                }
              </div>
              <div className="text-amber-600/75 flex flex-wrap gap-x-2 leading-4 pl-4">
                {v.allCssVarsUsed.length
                  ? v.allCssVarsUsed.map(i => <div key={i}>var({i})</div>)
                  : null}
              </div>
            </div>
          )
        })}
      </div>

      <h3 className="mt-8! mb-4!">Custom Variants</h3>
      <div className="flex flex-col card p-6 gap-5 leading-3 text-nowrap overflow-auto text-[0.8em]">
        {Object.values(parsedCss.atCustomVariants).map((v, i) => {
          return (
            <div className="mb-2" key={i}>
              <div className="text-sm font-semibold">{v.name}</div>
              <div className="text-amber-600 flex flex-wrap gap-x-2 leading-4">
                {v.cssVarsUsed.length
                  ? v.cssVarsUsed.map(i => <div key={i}>var({i})</div>)
                  : <div className="text-gray-400">No CSS Variables</div>}
              </div>
              <div className="text-amber-600/50 flex flex-wrap gap-x-2 leading-4 pl-4">
                {v.allCssVarsUsed.length
                  ? v.allCssVarsUsed.map(i => <div key={i}>var({i})</div>)
                  : null}
              </div>
            </div>
          )
        })}
      </div>

      <h3 className="mt-8! mb-4!">Variable Declarations</h3>
      <div className="flex flex-col card p-6 gap-5 leading-3 text-nowrap overflow-auto text-[0.8em]">
        {Object.values(parsedCss.variableDeclarations).map((v, i) => {
          return (
            <div className="mb-2" key={i}>
              <div className="text-sm font-semibold">{v.name}<span className="font-normal">: {v.value}</span></div>
              <div className="text-amber-600 flex flex-wrap gap-x-2 leading-4">
                {v.cssVarsUsed.length
                  ? v.cssVarsUsed.map(i => <div key={i}>var({i})</div>)
                  : <div className="text-gray-400">No CSS Variables</div>}
              </div>
              <div className="text-amber-600/50 flex flex-wrap gap-x-2 pl-4 leading-4">
                {v.allCssVarsUsed.length
                  ? v.allCssVarsUsed.map(i => <div key={i}>var({i})</div>)
                  : null}
              </div>
            </div>
          )
        })}
      </div>


      <div className="*:leading-3x  " dangerouslySetInnerHTML={{
        __html: html,
      }}>
      </div>
    </div>
  )
}