import { getAppDocsStructure } from "@/app/docs";

export const dynamicParams = false

export async function generateStaticParams() {
  const docs = await getAppDocsStructure()
  const params = docs.flatMap((i) => {
    if (i.type === "folder") {
      return i.children?.map((j) => ({
        slug: [i.name, j.name],
      }))
    }
    return {
      slug: [i.name],
    }
  })
  return params
}

export default async function DocsArticlePage(props: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await props.params;
  try {
    // Import path cannot be stored in a variable but can be partially dynamic
    // const { default: Article } = await import(`@/lib/${ slug.join("/") }.mdx`)
    return (
      <div>
        Hello World
      </div>
      // <Article />
    )
  } catch (error) {
    console.error(error)
    return <div>Article not found</div>
  }
}