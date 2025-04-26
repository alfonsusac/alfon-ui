import type { NextConfig } from "next";
import createMDX from '@next/mdx'


const nextConfig: NextConfig = {
  /* config options here */
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  serverExternalPackages: ['@tailwindcss/postcss', 'tailwindcss']
};

const withMDX = createMDX({
  options: {
    // @ts-expect-error
    remarkPlugins: [['remark-frontmatter', { type: 'yaml', marker: '-' }]],
    rehypePlugins: [],
  }
})

// Merge MDX config with Next.js config
export default withMDX(nextConfig)