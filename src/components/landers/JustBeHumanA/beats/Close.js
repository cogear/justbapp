import { Reveal, StackedPoem } from '../motion'
import { Caption } from '../primitives'

export function Close({ content, assetByRole, products }) {
  const lines = content.poemLines.map((line) => ({
    text: line.text,
    style: {
      ...(line.italic ? { fontStyle: 'italic' } : null),
      ...(line.color ? { color: line.color } : null),
      ...(line.indent ? { marginLeft: line.indent } : null),
    },
  }))

  const sticky = content.sticky || {}

  return (
    <section style={{ position: 'relative' }}>
      <div style={{ padding: '180px 56px 220px', background: 'var(--b-sand)', textAlign: 'center' }}>
        <Reveal duration={1200}>
          <Caption style={{ marginBottom: 40 }}>{content.caption}</Caption>
        </Reveal>
        <StackedPoem
          delay={200}
          baseDelay={420}
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 132,
            lineHeight: 0.96,
            letterSpacing: '-0.03em',
            fontWeight: 400,
            margin: 0,
            color: 'var(--b-ink)',
          }}
          lines={lines}
        />
        <Reveal delay={1300} duration={1400}>
          <p
            className="b-serif"
            style={{
              fontStyle: 'italic',
              fontSize: 22,
              color: 'var(--b-ink-soft)',
              maxWidth: 540,
              margin: '40px auto 0',
              lineHeight: 1.6,
            }}
          >
            {content.body}
          </p>
        </Reveal>
      </div>

      <div
        style={{
          position: 'sticky',
          bottom: 16,
          margin: '0 24px',
          background: 'var(--b-night)',
          color: 'var(--b-sand)',
          borderRadius: 26,
          padding: '20px 28px',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto auto',
          alignItems: 'center',
          gap: 24,
          boxShadow: '0 24px 60px -20px var(--b-shadow)',
        }}
      >
        <div>
          <div className="b-serif" style={{ fontSize: 18, lineHeight: 1.1 }}>
            {sticky.name}
          </div>
          {sticky.sizeLabel && (
            <div
              className="b-mono"
              style={{
                fontSize: 10,
                letterSpacing: '0.14em',
                color: 'rgba(245,242,235,0.6)',
                marginTop: 4,
              }}
            >
              {sticky.sizeLabel}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {products.map((p) => {
            const variantThumb = assetByRole[`variant-${p.id}`]
            return (
              <div
                key={p.id}
                title={p.name}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: p.textColor,
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1px solid rgba(245,242,235,0.08)',
                }}
              >
                {variantThumb && (
                  <img
                    src={variantThumb}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  />
                )}
              </div>
            )
          })}
        </div>
        {sticky.salePrice ? (
          <div className="b-serif" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.05 }}>
            <span
              style={{
                fontSize: 14,
                textDecoration: 'line-through',
                color: 'rgba(245,242,235,0.55)',
              }}
            >
              {sticky.price}
            </span>
            <span style={{ fontSize: 22 }}>{sticky.salePrice}</span>
          </div>
        ) : (
          <div className="b-serif" style={{ fontSize: 20 }}>
            {sticky.price}
          </div>
        )}
        {sticky.buyUrl ? (
          <a
            href={sticky.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '14px 28px',
              borderRadius: 999,
              background: 'var(--b-sand)',
              color: 'var(--b-night)',
              fontSize: 13,
              letterSpacing: '0.04em',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            {sticky.cta}
          </a>
        ) : (
          <div
            style={{
              padding: '14px 28px',
              borderRadius: 999,
              background: 'var(--b-sand)',
              color: 'var(--b-night)',
              fontSize: 13,
              letterSpacing: '0.04em',
            }}
          >
            {sticky.cta}
          </div>
        )}
      </div>
      <div style={{ height: 60, background: 'var(--b-sand)' }} />
    </section>
  )
}
