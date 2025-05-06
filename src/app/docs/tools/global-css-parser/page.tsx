// import { resolveCustomVariants } from "@/lib/tw/resolve-dependencies";
import { parseTailwindCSS } from "@/lib/tw/twcss/parse-css";
import { readFile } from "fs/promises";
import { codeToHtml } from "shiki";

export default async function GlobalCssParserPage() {

  const defaultglobalcss = await readFile('./node_modules/tailwindcss/theme.css', 'utf-8')
  const globalcss = await readFile('./src/app/globals.css', 'utf-8')
  const parsedCss = parseTailwindCSS(defaultglobalcss + '\n' + globalcss)

  const html = await codeToHtml(JSON.stringify(parsedCss, null, 2), {
    lang: "json",
    theme: "min-light",
  })

  return (
    <div className="tracking-tighter">
      <header className="mb-8">
        <h1>Tailwind Global CSS Parser</h1>
      </header>

      <h3 className="mt-8! mb-4!">Custom Utilities</h3>
      <div className="flex flex-col card p-6 gap-5 leading-3 text-nowrap overflow-auto  text-[0.8em]">
        {Object.values(parsedCss.atUtilities).map((v, i) => {
          return (
            <div className="" key={i}>
              <div className="text-sm font-semibold">{v.name} {v.type === "dynamic" && <span className="font-normal">(dynamic)</span>}</div>
              {
                v.type === "dynamic" && <>
                  <div className="text-blue-700 flex flex-wrap gap-x-4 leading-4">
                    {Object.keys(v.themedValueParams).length
                      ? <>{Object.keys(v.themedValueParams).map(i => <div key={i}>{`value(${ i })`}</div>)}</>
                      : <div className="text-blue-700/25">No Modifier Types</div>
                    }
                  </div>
                  <div className="text-blue-700 flex flex-wrap gap-x-2 leading-4">
                    {Object.keys(v.themedModifierParams).length
                      ? <>{Object.keys(v.themedModifierParams).map(i => <div key={i}>{`modifier(${ i })`}</div>)}</>
                      : <div className="text-blue-700/25">No Modifier Types</div>
                    }
                  </div>
                </>
              }
              <div className="text-amber-600 flex flex-wrap gap-x-2 leading-4">
                {v.meta.cssVarsUsed.length
                  ? v.meta.cssVarsUsed.map(i => <div key={i}>var({i})</div>)
                  : <div className="text-amber-600/25">No CSS Variables</div>}
              </div>
              <div className="text-green-700 flex flex-wrap gap-x-2 leading-4">
                {v.meta.classNamesUsed.length
                  ? v.meta.classNamesUsed.map(i => <div key={i}>{`${ i }`}</div>)
                  : <div className="text-green-700/25">No Class Names</div>
                }
              </div>
              <div className="text-amber-600/75 flex flex-wrap gap-x-2 leading-4 pl-4">
                {v.allCssVarsUsed.length
                  ? v.allCssVarsUsed.map(i => <div key={i}>var({i})</div>)
                  : null}
              </div>
              <div className="text-indigo-600/75 flex flex-wrap gap-x-2 leading-4 pl-4">
                {v.customUtilityUsed.length
                  ? v.customUtilityUsed.map((i, index) => <div key={index}>{i.name}</div>)
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
                {v.meta.cssVarsUsed.length
                  ? v.meta.cssVarsUsed.map(i => <div key={i}>var({i})</div>)
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
                {v.meta.cssVarsUsed.length
                  ? v.meta.cssVarsUsed.map(i => <div key={i}>var({i})</div>)
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