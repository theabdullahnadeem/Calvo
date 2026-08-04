/**
 * Renders a JSON-LD document into the page.
 *
 * A plain <script> in the server-rendered HTML rather than next/script: search
 * crawlers read structured data from the initial response, so deferring it to a
 * client-side injection is the one place where "load it later" actively costs
 * you the thing you added it for.
 *
 * Renders nothing visible, so it cannot affect layout.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is inserted verbatim; `<` is escaped so a string
      // in the content can never close the script tag early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}

export default JsonLd;
