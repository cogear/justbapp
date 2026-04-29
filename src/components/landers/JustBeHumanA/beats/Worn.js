import { KenBurns, Reveal } from '../motion'
import { Caption, PhotoBrief } from '../primitives'

function WornFrame({ brief, src, h }) {
  if (src) {
    return (
      <div style={{ height: h, width: '100%', overflow: 'hidden', background: brief.bg || '#A89886' }}>
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    )
  }
  return <PhotoBrief h={h} bg={brief.bg} label={brief.label} sub={brief.sub} />
}

export function Worn({ content, assetByRole, products }) {
  const src = assetByRole[`variant-${content.variantId}`]
  const variant = products.find((p) => p.id === content.variantId)
  const briefs = content.photoBriefs || []

  return (
    <section style={{ padding: '140px 0 140px' }}>
      <div style={{ padding: '0 56px', marginBottom: 72 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: 32,
            alignItems: 'baseline',
          }}
        >
          <Caption>{content.chapter}</Caption>
          <h3
            className="b-serif"
            style={{
              fontSize: 72,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              fontWeight: 400,
              margin: 0,
              fontStyle: 'italic',
            }}
          >
            {content.headline}
          </h3>
          <Caption>{content.pageNumber}</Caption>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: 32,
          padding: '0 56px',
        }}
      >
        <KenBurns
          from={{ scale: 1.04, x: -2, y: -1 }}
          to={{ scale: 1.1, x: 2, y: 1 }}
          style={{
            height: 620,
            background: variant?.textColor || '#E8DDC8',
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
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          )}
        </KenBurns>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {briefs[0] && (
            <WornFrame brief={briefs[0]} src={assetByRole['worn-portrait-0']} h={briefs[0].h || 300} />
          )}
          <Reveal delay={200}>
            <p
              className="b-serif"
              style={{
                fontSize: 19,
                lineHeight: 1.55,
                fontStyle: 'italic',
                color: 'var(--b-ink)',
                margin: 0,
              }}
            >
              {content.quote}
            </p>
          </Reveal>
          {briefs[1] && (
            <WornFrame brief={briefs[1]} src={assetByRole['worn-portrait-1']} h={briefs[1].h || 260} />
          )}
        </div>
      </div>
    </section>
  )
}
