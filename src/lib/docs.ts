import { readdir } from "node:fs/promises";

export type DocsStructure =
  | DocsStructureFolder
  | DocsStructureFile

export type DocsStructureFolder = {
  name: string
  type: "folder"
  children?: DocsStructure[]
}
export type DocsStructureFile = {
  name: string
  type: "file"
  href: string
}


export async function getDocsStructure(sourcePath: string, hrefBasePath: `/${ string }`, extension: string = 'mdx') {

  const dir = await readdir(sourcePath, { withFileTypes: true }).catch(e => {
    console.error(e + " - " + sourcePath + " Current dir: " + process.cwd())
    throw e
  })

  const structure: DocsStructure[] = []

  for (const i of dir) {
    if (i.isDirectory()) {
      const children = await getDocsStructure(`${ sourcePath }/${ i.name }`, hrefBasePath + `/${ i.name }` as `/${ string }`, extension)
      if (children.length !== 0)
        structure.push({
          name: i.name,
          type: "folder",
          children
        })
    } else if (i.isFile() && i.name.endsWith(`.${ extension }`)) {
      console.log("Adding file: ", i.name, "searching for", extension)
      structure.push({
        name: i.name.split(`.${ extension }`)[0],
        type: "file",
        href: resolvePath(hrefBasePath, `/${ i.name.split(`.${extension}`)[0] }`),
      })
    }
  }
  return structure

}








function resolvePath(...paths: (`/${ string }` | undefined)[]) {
  return paths.map(p => p?.replace(/\/+$/, '')).join('')
}

