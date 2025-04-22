import { LucideArrowRight } from "./icons";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto min-h-screen px-4 flex flex-col">
      <div className="pt-20 flex flex-col gap-8 grow">

        <header className="flex flex-col gap-2 max-w-xl">
          <h1 className="text-4xl tracking-[-0.1em] font-light p-1 font-mono">
            alfon/ui
          </h1>
          <div className="p-1 opacity-50 font-medium text-lg leading-snug">
            Flexible and powerful UI components for your Next.js app. And also just a bunch of UI related snippets.
          </div>
        </header>

        <section className="flex flex-col p-1">
          <h2 className="text-sm font-mono tracking-tight text-current/20 py-2 px-1">Directory</h2>
          <div className="flex flex-col p-1">
            {
              [
                { title: "🧩  Docs", link: "/docs", },

                // { title: "🧩  Components", link: "/headless", },
                // { title: "🎨  Design System", link: "/design-system", },
                // { title: "🔧  Hooks", link: "/hooks", },
                // { title: "📦  Miscellaneous", link: "/misc", }
              ].map((i) => {
                return (
                  <a
                    key={i.title}
                    href={i.link}
                    className="p-1 px-2 hover:bg-current/5 whitespace-pre flex items-center focus:outline-3 focus:outline-current/10"
                  >
                    {i.title} <LucideArrowRight strokeWidth={2} />
                  </a>
                )
              })
            }
          </div>
        </section>

        <section className="flex flex-col p-1">
          <h2 className="text-sm font-mono tracking-tight text-current/20 py-2 px-1">Components</h2>
          <div className="grid grid-cols-3">
            {

            }
          </div>
        </section>

      </div>
    </div>
  );
}
