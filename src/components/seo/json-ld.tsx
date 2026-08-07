/**
 * Renders a JSON-LD block.
 *
 * The `<` escape is not cosmetic: lesson titles and markdown-derived summaries
 * feed these nodes, and a literal `</script>` inside a string would close the
 * tag and inject the rest of the JSON into the document as markup.
 */
export function JsonLd({ data }: { data: object | object[] }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(data).replace(/</g, '\\u003c'),
            }}
        />
    );
}
