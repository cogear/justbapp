import { KenBurns, Parallax } from '../motion'
import { Caption } from '../primitives'

export function Detail({ content, assetByRole, products }) {
  const src = assetByRole[`variant-${content.variantId}`]
  const variant = products.find((p) => p.id === content.variantId)

  const subLines = (content.subWord || '').split('\n')

  return (
    <section style={{ padding: '140px 56px', background: 'var(--b-mist)' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.4fr 1fr',
          gap: 32,
          alignItems: 'center',
        }}
      >
        <div style={{ alignSelf: 'start' }}>
          <Caption style={{ marginBottom: 18 }}>{content.caption}</Caption>
          <p
            className="b-serif"
            style={{
              fontStyle: 'italic',
              fontSize: 22,
              lineHeight: 1.5,
              color: 'var(--b-ink)',
              margin: 0,
            }}
          >
            {content.paragraph}
          </p>
        </div>

        <KenBurns
          from={{ scale: 2.2, x: -1.5, y: 0 }}
          to={{ scale: 2.6, x: 1.5, y: 0 }}
          style={{
            width: '100%',
            height: 620,
            background: variant?.textColor || '#E08A60',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {src && (
            <img
              src={src}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                // Frame on the chest print: cover the container and anchor the
                // upper third of the mockup so "just be human." sits center-screen.
                objectFit: 'cover',
                objectPosition: 'center 45%',
              }}
            />
          )}
        </KenBurns>

        <Parallax rate={0.06}>
          <div className="b-serif" style={{ color: 'var(--b-ink)', textAlign: 'left' }}>
            <span
              style={{
                display: 'block',
                fontSize: 140,
                lineHeight: 0.9,
                letterSpacing: '-0.04em',
                fontStyle: 'italic',
              }}
            >
              {content.bigWord}
            </span>
            <span
              style={{
                display: 'block',
                fontStyle: 'italic',
                fontSize: 22,
                lineHeight: 1.5,
                marginTop: 18,
                color: 'var(--b-ink-soft)',
              }}
            >
              {subLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < subLines.length - 1 && <br />}
                </span>
              ))}
            </span>
          </div>
        </Parallax>
      </div>
    </section>
  )
}
