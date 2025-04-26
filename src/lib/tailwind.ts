import { readFile } from "fs/promises";
import postcss from "postcss";

async function testTailwindCompiler() {
  const rawGlobalCSS = await readFile("./src/app/global.css", "utf-8");
  const defaultTheme = await getDefaultTheme();
  const twcss = compileTailwindCSS([defaultTheme, rawGlobalCSS].join('\n'));
}

async function getDefaultTheme() {
  const rawGlobalCSS = await readFile("./node_modules/tailwindcss/theme.css", "utf-8");
  return compileTailwindCSS(rawGlobalCSS);
}

function compileTailwindCSS(rawglobalcss: string) {
  const css = postcss.parse(rawglobalcss)
}


// --- Default Utilities --------------------
