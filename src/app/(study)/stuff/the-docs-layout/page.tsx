export default function TheDocsLayoutPage() {
  return (
    <div className="py-20 px-8 
                    [&_p]:text-muted [&_p]:max-w-lg [&_p]:my-4
                    [&_em]:brightness-150
                    [&_h1]:text-5xl [&_h1]:tracking-tighter [&_h1]:font-medium
                    [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:tracking-tight
                    [&_h3]:text-lg
                    [&_hr]:max-w-lg [&_hr]:border-muted/25
    ">
      <h1>Studying Docs Layouts</h1>
      <p>
        This is a place for me to study existing docs layout and journal my findings on how to create the docs layout I like.
      </p>

      <br /><hr /><br />

      
      <h2>1</h2>
      <p>
        I discovered that <em>sticky</em> might be elegant for implementing sidebars and navbars later found out it has its shortcomings particularly with <em>scroll bouncing</em>. It is when user scroll so fast the browser makes the bouncy effects showing the elements past the scroll edge. One of the solution I found is to <em>design the layout around the fixed-position</em> instead.
      </p>
      
    </div>
  )
}