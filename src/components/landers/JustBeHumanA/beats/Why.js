import { Reveal, Parallax } from '../motion'
import { Caption, Shirt } from '../primitives'

export function Why({ content, assetByRole }) {
  const variantSrc = assetByRole[`variant-${content.variantId}`]

  return (
    <section
      style={{
        padding: '120px 56px',
        borderTop: '1px solid var(--b-line)',
        borderBottom: '1px solid var(--b-line)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 56,
          alignItems: 'end',
          marginBottom: 80,
        }}
      >
        <Caption>{content.chapter}</Caption>
        <hr style={{ height: 1, background: 'var(--b-line)', border: 'none', margin: 0 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 80, alignItems: 'start' }}>
        <div>
          <Reveal duration={1600}>
            <h2
              className="b-serif"
              style={{
                fontSize: 92,
                lineHeight: 1.02,
                letterSpacing: '-0.02em',
                fontWeight: 400,
                margin: 0,
                color: 'var(--b-ink)',
              }}
            >
              {content.headline}
              <em style={{ color: 'var(--b-clay)' }}>{content.headlineEm}</em>
            </h2>
          </Reveal>
          <Reveal delay={400} duration={1400}>
            <div
              style={{
                marginTop: 56,
                columns: 2,
                columnGap: 40,
                fontSize: 18,
                lineHeight: 1.65,
                color: 'var(--b-ink-soft)',
              }}
            >
              <p style={{ marginTop: 0 }}>
                <span
                  className="b-serif"
                  style={{
                    fontSize: 80,
                    float: 'left',
                    lineHeight: 0.86,
                    marginRight: 12,
                    marginTop: 6,
                    color: 'var(--b-ink)',
                  }}
                >
                  {content.dropCap}
                </span>
                {content.paragraphs[0]}
              </p>
              {content.paragraphs.slice(1).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Reveal>
        </div>

        <Parallax rate={-0.16} style={{ position: 'relative', marginTop: -40 }}>
          <Shirt src={variantSrc} bg="var(--b-paper-warm)" h={520} pad={12} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'flex-end',
              padding: '32px 36px',
              pointerEvents: 'none',
            }}
          >
            <Reveal delay={300} duration={1200}>
              <div
                className="b-serif"
                style={{
                  fontStyle: 'italic',
                  fontSize: 56,
                  lineHeight: 1.05,
                  letterSpacing: '-0.01em',
                  color: 'var(--b-ink)',
                  maxWidth: '78%',
                  textShadow: '0 2px 24px var(--b-glow), 0 1px 2px var(--b-glow)',
                }}
              >
                {content.callout}
              </div>
            </Reveal>
          </div>
        </Parallax>
      </div>
    </section>
  )
}
