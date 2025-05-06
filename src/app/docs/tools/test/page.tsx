import postcssValueParser from "postcss-value-parser"

export default function TestPage() { 

  const res = postcssValueParser('var(var(--tw-prose-body))')

  console.log(JSON.stringify(res, null, 2))


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Test Page</h1>
      <p>This is a test page for Tailwind CSS parsing.</p>
    </div>
  )
}