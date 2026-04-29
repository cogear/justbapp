import { Reveal, Parallax, StackedPoem, CrossfadeFrames } from '../motion'
import { Caption, PhotoBrief, PRODUCTS } from '../primitives'

export function Hero({ content, assetByRole }) {
  const heroVariant = PRODUCTS.find((p) => p.id === content.heroVariantId)
  const shirtBg = heroVariant?.textColor || 'var(--b-paper)'

  const lines = content.poemLines.map((line) => ({
    text: line.text,
    style: {
      ...(line.italic ? { fontStyle: 'italic' } : null),
      ...(line.color ? { color: line.color } : null),
      ...(line.indent ? { marginLeft: line.indent } : null),
    },
  }))

  return (
    <section style={{ padding: '56px 56px 96px', position: 'relative' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 56, alignItems: 'start' }}>
        <div>
          <Reveal duration={1200}>
            <Caption style={{ marginBottom: 36 }}>{content.caption}</Caption>
          </Reveal>
          <StackedPoem
            delay={300}
            baseDelay={420}
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 168,
              lineHeight: 0.92,
              letterSpacing: '-0.03em',
              fontWeight: 400,
              color: 'var(--b-ink)',
              margin: 0,
            }}
            lines={lines}
          />
          <Reveal delay={1400} duration={1400}>
            <div style={{ marginTop: 56, maxWidth: 460, fontSize: 20, lineHeight: 1.6, color: 'var(--b-ink-soft)' }}>
              {content.body}
            </div>
          </Reveal>
        </div>

        <Parallax rate={-0.08} style={{ position: 'relative' }}>
          <CrossfadeFrames interval={6000} fade={2400} style={{ height: 780 }}>
            {(content.photoBriefs && content.photoBriefs.length > 0
              ? content.photoBriefs
              : [{ bg: shirtBg, label: 'Hero portrait — generate frames in Beat 1.', sub: 'placeholder' }]
            ).map((brief, i) => {
              const portraitSrc = assetByRole[`hero-portrait-${i}`]
              if (portraitSrc) {
                return (
                  <div
                    key={i}
                    style={{
                      height: 780,
                      width: '100%',
                      background: brief.bg,
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={portraitSrc}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                )
              }
              return <PhotoBrief key={i} h={780} bg={brief.bg} label={brief.label} sub={brief.sub} />
            })}
          </CrossfadeFrames>
          <div style={{ position: 'absolute', top: -18, right: -12, transform: 'rotate(8deg)' }}>
            <div className="b-serif" style={{ fontStyle: 'italic', fontSize: 22, color: 'var(--b-clay)' }}>
              {content.plateNumeral}
            </div>
          </div>
          <div
            style={{
              marginTop: 18,
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--b-ink-muted)',
            }}
          >
            <span>{content.plateLabel}</span>
            <span
              className="b-serif"
              style={{ fontStyle: 'italic', textTransform: 'none', letterSpacing: 0, fontSize: 13 }}
            >
              {content.photoCaption}
            </span>
            <span>{content.pageNumber}</span>
          </div>
        </Parallax>
      </div>
    </section>
  )
}
