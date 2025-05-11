import { cn } from "lazy-cn";
import { ClassNameTag } from "../../layouts/controls";
import type { ComponentProps } from "react";

export default function ModesOfFlexPage() {
  return (
    <div className="py-20 px-8 
                    [&_p]:text-muted [&_p]:max-w-lg [&_p]:my-4
                    [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:tracking-tight
                    [&_h3]:text-lg"
    >

      <h1 className="text-5xl tracking-tighter font-medium">Modes of Flex</h1>
      <p>This page explores the different modes of flexbox layout. It includes examples of how to use flexbox in different ways.</p>

      <br />
      <br />
      <h2>Flex as a stack</h2>
      <p>This is the default mode of flexbox. It stacks items vertically or horizontally depending on the flex direction.</p>

      <PreviewBox>
        <PreviewLabel>flex gap-2</PreviewLabel>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((e, i) => <div className="bg-zinc-600 w-20 h-10 rounded-md" key={i}></div>)}
        </div>
      </PreviewBox>

      <p>However, the default mode of flexbox behaves kidna unintuitively when theres many elements inside:</p>

      <PreviewBox>
        <PreviewLabel>flex gap-2</PreviewLabel>
        <div className="flex gap-2">
          {Array.from({ length: 10 }).map((e, i) => <div className="bg-zinc-600 w-20 h-10 rounded-md" key={i}></div>)}
        </div>
      </PreviewBox>

      <p>We can use flex-warp to solve this problem. This will make the flex items wrap to the next line when they run out of space.</p>

      <PreviewBox>
        <PreviewLabel>flex gap-2 flex-wrap</PreviewLabel>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 10 }).map((e, i) => <div className="bg-zinc-600 w-20 h-10 rounded-md" key={i}></div>)}
        </div>
      </PreviewBox>


      <br />
      <br />
      <h2>Flex for hierarchy of importance</h2>
      <p>You can also use flexbox to create a hierarchy of importance. This is done by using the flex properties. </p>

      <PreviewBox>
        <PreviewLabel>flex gap-2</PreviewLabel>
        <div className="flex gap-2">
          <div className="bg-zinc-600 grow w-20 h-10 rounded-md "><PreviewLabel className="m-1">grow</PreviewLabel></div>
          <div className="bg-zinc-600 w-20 h-10 rounded-md " />
        </div>
      </PreviewBox>

      <p>You can also specify the quantity of space to take up. In this case, grow-2 takes 2/5 of the whole space and grow-3 takes 3/5 of the whole space.</p>
      <PreviewBox>
        <PreviewLabel>flex gap-2</PreviewLabel>
        <div className="flex gap-2">
          <div className="bg-zinc-600 grow-3 w-20 h-10 rounded-md"><PreviewLabel className="m-1">grow-3</PreviewLabel></div>
          <div className="bg-zinc-600 grow-2 w-20 h-10 rounded-md"><PreviewLabel className="m-1">grow-2</PreviewLabel></div>
        </div>
      </PreviewBox>

      <p>However, there is a big problem when using grow against a content that can set the intrinsic size of an item. Most common example is having a long text inside a flex item. You would notice that setting grow-3 to make one item larger doesn't work here.</p>

      <PreviewBox>
        <PreviewLabel>flex gap-2</PreviewLabel>
        <div className="flex gap-2">
          <div className="bg-zinc-700 p-3 py-2 text-sm grow-3">
            <PreviewLabel>grow-3</PreviewLabel>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio voluptates magni minima animi
          </div>
          <div className="bg-zinc-700 p-3 py-2 text-sm grow">
            <PreviewLabel>grow</PreviewLabel>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio voluptates magni minima animi
          </div>
        </div>
      </PreviewBox>

      <p>
        This is because, flex-grow doesn't scale the entire size of the item — it only distributes extra space after the intrinsic size of the content has been calculated.
      </p>
      <p>
        In order to fix this, we can use the flex-basis property to give up automatic intrinsic size calculation and let the size of the item be determined by the flex properties, thereby gaining control over the size of the item.
      </p>

      <PreviewBox>
        <PreviewLabel>flex gap-2</PreviewLabel>
        <div className="flex gap-2">
          <div className="bg-zinc-700 p-3 py-2 text-sm grow-3 basis-0">
            <PreviewLabel>grow-3 basis-0</PreviewLabel>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio voluptates magni minima animi
          </div>
          <div className="bg-zinc-700 p-3 py-2 text-sm grow basis-0">
            <PreviewLabel>grow basis-0</PreviewLabel>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio voluptates magni minima animi
          </div>
        </div>
      </PreviewBox>

      <br />
      <br />
      <h2>Flex for item containment</h2>

      <p>
        Flex as item containment primarily focuses on the thing that has been illustrated in the first section – mainly about how you can use flex to automatically set the size of an item based on the size of its children. This is done by using the flex properties. Most commonly seen in buttons and badges.
      </p>

      <PreviewBox>
        <PreviewLabel>block space-y-2 *:flex *:items-center *:justify-center</PreviewLabel>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((e, i) => <div className="bg-zinc-600 w-20 h-10 rounded-lg flex items-center justify-center" key={i}>Button</div>)}
        </div>
      </PreviewBox>

      <PreviewBox>
        <PreviewLabel>block space-x-2 *:inline-flex *:items-center *:justify-center</PreviewLabel>
        <div className="space-x-2">
          {Array.from({ length: 5 }).map((e, i) => <div className="bg-zinc-600 w-20 h-10 rounded-lg inline-flex items-center justify-center" key={i}>Button</div>)}
        </div>
      </PreviewBox>

      <p>
        This works because flex's default flex-basis value is auto. Which sets the initial size of a flex item into its intrinsic size. Which is whatever the size of its content be.
      </p>



      <br />
      <br />
      <h2>Flex for central emphasis</h2>

      <PreviewBox>
        <PreviewLabel>flex items-center justify-center</PreviewLabel>
        <div className="flex items-center justify-center h-40">
          <div>Hello World</div>
        </div>
      </PreviewBox>



      <br />
      <br />
      <h2>Flex for baseline alignment</h2>

      <PreviewBox>
        <PreviewLabel>flex items-baseline justify-center</PreviewLabel>
        <div className="flex items-baseline justify-center gap-2 py-8">
          <div className="p-1 bg-zinc-700 rounded">Hello World</div>
          <div className="p-2 bg-zinc-700 rounded">Hello World</div>
          <div className="p-3 bg-zinc-700 rounded space-y-2">
            <div className="h-1 bg-amber-600 rounded-full" />
            <div>
              Nested Hello World
            </div>
            <div className="h-1 bg-gree-600 rounded-full" />
          </div>
          <div className="p-4 bg-zinc-700 rounded basis-0 grow">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Suscipit eligendi quae, unde nihil veniam sapiente saepe aspernatur dolores ex facere itaque, alias veritatis reprehenderit vero asperiores corporis? Eum, rem ullam!</div>
        </div>
      </PreviewBox>



    </div>
  )
}


function PreviewBox(props: ComponentProps<"div">) {
  return (
    <div {...props} className={cn("my-4 border border-current/5 bg-black/10 p-3 space-y-1.5 max-w-2xl rounded-xl resize-x overflow-x-hidden", props.className)} />
  )
}

function PreviewLabel(props: ComponentProps<"div">) {
  return (
    <div {...props} className={cn("text-xs font-mono tracking-tighter text-muted leading-3", props.className)} />
  )
}