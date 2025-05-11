import { cn } from "lazy-cn";
import type { ComponentProps } from "react";

export default function ModesOfFlexPage() {
  return (
    <div className="py-20 px-8 
                    [&_p]:text-muted [&_p]:max-w-lg [&_p]:my-4
                    [&_em]:brightness-150
                    [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:tracking-tight
                    [&_h3]:text-lg"
    >

      <h1 className="text-5xl tracking-tighter font-medium">Modes of Flex</h1>
      <p>
        This article explores the three fundamental modes of flexbox that form the backbone of most modern UI layouts. These modes are not merely technical features, but conceptual primitives that can be applied across a wide range of design scenarios. Understanding them will help clarify how flexbox functions at its core, enabling you to reason about layouts in simpler, more intuitive ways.
      </p>

      <p>
        Hopefully, readers can walk away with mental models that make all other flexbox behaviors easier to reason about, understand why the defaults are set the way they are, and feel more confident in modifying the rest of the flex properties to suit their needs.
      </p>

      <p>
        <em>Protip!</em> Drag the handles on the bottom right of the preview boxes to see how the flex items behave when the screen size changes. This is a great way to understand how flexbox works in practice.
      </p>

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

      <p>
        It is also content-first. An important default which may have its drawback explained in later section. its a useful replacement for inline elements.
      </p>

      <PreviewBox>
        <PreviewLabel>flex gap-2</PreviewLabel>
        <div className="flex gap-2 text-white/75 text-sm">
          <div className="bg-zinc-600 px-4 py-2 rounded-md ">Music</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">Language</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">Friendship</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">Wellness</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">Inattentiveness</div>
        </div>
      </PreviewBox>


      <p>However, the default mode of flexbox behaves unintuitively when there are many elements inside (try resizing):</p>

      <PreviewBox>
        <PreviewLabel>flex gap-2</PreviewLabel>
        <div className="flex gap-2 text-white/75 text-sm">
          <div className="bg-zinc-600 px-4 py-2 rounded-md ">According</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">to</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">the</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">laws</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">of</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">aviation</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">there</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">is</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">no</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">way</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">that</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">a</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">bee</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">should</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">be</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">able</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">to</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">fly</div>
          {/* {Array.from({ length: 10 }).map((e, i) => <div className="bg-zinc-600 w-20 h-10 rounded-md" key={i}></div>)} */}
        </div>
      </PreviewBox>

      <p>We can use flex-warp to solve this problem. This will make the flex items wrap to the next line when they run out of space.</p>

      <PreviewBox>
        <PreviewLabel>flex gap-2 flex-wrap</PreviewLabel>
        <div className="flex gap-2 flex-wrap  text-white/75 text-sm">
          <div className="bg-zinc-600 px-4 py-2 rounded-md ">Walt</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">White</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">Jesse</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">Pinkman</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">Hank</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">Schrader</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">Saul</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">Goodman</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">Tuco</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">Salamanca</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">Gus</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">Fring</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">Mike</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">Ehrmantraut</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">Lydia</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">Rodarte</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">Hector</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">Saul</div>
          <div className="bg-zinc-600 px-4 py-2 rounded-md">Flynn</div>
          {/* {Array.from({ length: 10 }).map((e, i) => <div className="bg-zinc-600 w-20 h-10 rounded-md" key={i}></div>)} */}
        </div>
      </PreviewBox>


      <br />
      <br />
      <h2>Flex as importance hierarchy distribution</h2>
      <p>You can also use flexbox to create a hierarchy of importance. This is done by using the flex specific css properties. </p>

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
          <div className="bg-zinc-600 grow-3 rounded-md p-4"><PreviewLabel className="m-1">grow-3</PreviewLabel>
          </div>
          <div className="bg-zinc-600 grow-2 rounded-md p-4 text-sm"><PreviewLabel className="m-1">grow-2</PreviewLabel>
          </div>
        </div>
      </PreviewBox>

      <p>However, there is a big problem when using grow against a content that can set the <em>intrinsic size</em> of an item. Most common example is having a long text inside a flex item. You would notice that setting grow-3 to make one item larger doesn't work here.</p>

      <PreviewBox>
        <PreviewLabel>flex gap-2</PreviewLabel>
        <div className="flex gap-2">
          <div className="bg-zinc-700 p-3 py-2 grow-3 text-4xl font-medium tracking-tighter">
            <PreviewLabel>grow-3</PreviewLabel>
            Help I'm squeezed in here
          </div>
          <div className="bg-zinc-700 p-3 py-2 text-sm grow">
            <PreviewLabel>grow</PreviewLabel>
            This element somehow exudes more power than the other element even though I have smaller text. And if you notice, the other team also have put `grow-3` but to no avail. If only they knew that flex-grow doesn't scale the entire size of the item, but only distributes extra space after the intrinsic size of the content has been calculated.
          </div>
        </div>
      </PreviewBox>

      <p>
        This is because, flex-grow doesn't scale the entire size of the item — it only distributes extra space after the intrinsic size of the content has been calculated.
      </p>
      <p>
        In order to fix this, we can use the <em>flex-basis</em> property to give up automatic intrinsic size calculation and let the size of the item be determined by the flex properties, thereby gaining control over the size of the item.
      </p>

      <PreviewBox>
        <PreviewLabel>flex gap-2</PreviewLabel>
        <div className="flex gap-2">
          <div className="bg-zinc-700 p-3 py-2 grow-3 basis-0  text-4xl font-medium tracking-tighter">
            <PreviewLabel>grow-3 basis-0</PreviewLabel>
            <div className="mt-3">
              Made for modern product teams
            </div>
          </div>
          <div className="bg-zinc-700 p-3 py-2 text-sm grow-2 basis-0">
            <PreviewLabel>grow-2 basis-0</PreviewLabel>
            I'm no longer the dominant power in this flex dynamic. I wish to concede as the smaller, lesser element. I am now at peace with my new identity.
          </div>
        </div>
      </PreviewBox>

      <p>
        Alternatively, you can also use what is ultimately the shortest way to do this, which is to use the <em>flex</em> property. This is a shorthand for flex-grow, flex-shrink and flex-basis. It is the most common way to use flexbox in modern UI systems.
      </p>


      <PreviewBox>
        <PreviewLabel>flex gap-2</PreviewLabel>
        <div className="flex gap-2">
          <div className="bg-zinc-700 p-3 py-2 text-sm flex-2">
            <PreviewLabel>flex-2</PreviewLabel>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio voluptates magni minima animi
          </div>
          <div className="bg-zinc-700 p-3 py-2 text-sm flex-5">
            <PreviewLabel>flex-5</PreviewLabel>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio voluptates magni minima animi
          </div>
        </div>
      </PreviewBox>

      <br />
      <br />
      <h2>Flex as item containment</h2>

      <p>
        Flex as item containment primarily focuses on as shown earlier – mainly about how you can use flex to automatically set the size of an item based on the size of its children. Most commonly seen in buttons and badges.
      </p>

      <p>
        Often, we begin with a block element. It stretches to fill the parent, even if its content is minimal. So the question arises: How do we make this element only as large as its content? How do we contain it, precisely and responsively?
      </p>

      <PreviewBox>

        <PreviewLabel>block</PreviewLabel>
        <div className="block space-y-2 text-sm text-white/75">
          <div className="p-2 px-4 bg-zinc-600 rounded-lg">Send Message to Dylan</div>
          <div className="p-2 px-4 bg-zinc-600 rounded-lg">Send Message to Andrea</div>
          <div className="p-2 px-4 bg-zinc-600 rounded-lg">Ignore Messages from Ruby</div>
        </div>

        <br />
        <PreviewLabel>flex flex-col</PreviewLabel>
        <div className="flex flex-col gap-2 text-sm text-white/75">
          <div className="p-2 px-4 bg-zinc-600 rounded-lg">Send Message to Dylan</div>
          <div className="p-2 px-4 bg-zinc-600 rounded-lg">Send Message to Andrea</div>
          <div className="p-2 px-4 bg-zinc-600 rounded-lg">Ignore Messages from Ruby</div>
        </div>

      </PreviewBox>

      <p>
        This is where Flex's alignment tools become structural. By using flex in combination with alignment, especially <em>align-items</em> or <em>align-self</em>, you constrain the flex items to the size of their children. The container stops stretching. It shrinks. It contains.
      </p>

      <PreviewBox>
        <PreviewLabel>flex flex-col items-start</PreviewLabel>
        <div className="flex flex-col items-start gap-2 text-sm text-white/75">
          <div className="p-2 px-4 bg-zinc-600 rounded-lg">Send Message to Dylan</div>
          <div className="p-2 px-4 bg-zinc-600 rounded-lg">Send Message to Andrea</div>
          <div className="p-2 px-4 bg-zinc-600 rounded-lg">Ignore Messages from Ruby</div>
        </div>

        <br />
        <PreviewLabel>flex flex-col gap-2</PreviewLabel>
        <div className="flex flex-col gap-2 text-sm text-white/75">
          <div className="p-2 px-4 bg-zinc-600 rounded-lg self-start">
            <PreviewLabel>self-start</PreviewLabel>
            I'm pretty much left behind without you
          </div>
          <div className="p-2 px-4 bg-zinc-600 rounded-lg self-end">
            <PreviewLabel>self-end</PreviewLabel>
            You're right
          </div>
          <div className="p-2 px-4 bg-zinc-600 rounded-lg self-center">
            <PreviewLabel>self-center</PreviewLabel>
            I'm too self-centered
          </div>

        </div>

      </PreviewBox>

      <p>
        This works because flex's default <em>flex-basis value is auto</em>. Which sets the initial size of a flex item into its intrinsic size. Which is whatever the size of its content be.
      </p>


      <br />
      <br />
      <h2>Examples with mixed concepts</h2>

      <br />
      <h3>Alignment</h3>

      <p>
        Just by using both <em>containment</em> and <em>stacking</em> you can center the item in the middle of the parent as well as have them stack from top to bottom. This is a common pattern used in modals and popups. I kinda wish there is a shorter way to write this though.
      </p>

      <PreviewBox>
        <PreviewLabel>flex flex-col items-center justify-center</PreviewLabel>
        <div className="flex flex-col items-center justify-center h-40">
          <div className="text-3xl tracking-tight font-medium">Best Example Ever</div>
          <div>Wouldn't you agree?</div>
        </div>
      </PreviewBox>

      <br />
      <hr className="max-w-lg border-muted/25" />
      <br />
      <p>
        More excercise are left for the reader to explore. I hope this article has been helpful in understanding the modes of flexbox. I would recommend you to try out the examples yourself and see how they behave when you resize the screen. You can also try out different combinations of flex properties to see how they affect the layout.
      </p>
      <p>
        If you like what you read, don't forget to share this article with your friends and colleagues and maybe post some words about it online. I would love to hear your thoughts and feedback on this article. You can also reach out to me if you have any questions or suggestions for future articles.
      </p>

      <footer className="pt-20">
        <p>
          Written by alfonsusac. source code at my github profile.
        </p>
      </footer>



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