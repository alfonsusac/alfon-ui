import { ClassNameParserClient } from "./client";
import { analyzeArbitrary } from "@/lib/tw/arbitrary";

export default function ClassNameParserPage() {
  const res = analyzeArbitrary('[--asdf,___var_(--a-123,__ar(--b)),_var(--c_a)]')
  console.log(res)
  return (
    <>
      <header className="mb-8">
        <h1>Tailwind Classname Parser</h1>
      </header>
      <ClassNameParserClient />
    </>
  )

}