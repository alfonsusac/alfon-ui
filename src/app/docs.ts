import { getDocsStructure } from "@/lib/docs";

export async function getAppDocsStructure() {
  return getDocsStructure('./src/lib', '/docs')
}

