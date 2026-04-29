import { Reveal } from '../motion'
import { Caption, Shirt } from '../primitives'

export function Variants({ content, assetByRole, products }) {
  return (
    <section
      style={{
        padding: '140px 56px',
        background: 'var(--b-sand)',
        borderTop: '1px solid var(--b-line)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'end',
          marginBottom: 64,
        }}
      >
        <Caption>{content.captionLeft}</Caption>
        <h3
          className="b-serif"
          style={{
            fontSize: 56,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            fontWeight: 400,
            margin: 0,
            fontStyle: 'italic',
            textAlign: 'center',
          }}
        >
          {content.headline}
        </h3>
        <Caption style={{ textAlign: 'right' }}>{content.captionRight}</Caption>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
        {products.map((p, i) => {
          const src = assetByRole[`variant-${p.id}`]
          return (
            <Reveal key={p.id} delay={i * 110} duration={1300} lift={24}>
              <div style={{ marginTop: i % 2 === 1 ? 40 : 0 }}>
                <Shirt src={src} bg="transparent" h={600} pad={6} />
                <div
                  style={{
                    marginTop: 14,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <div
                    className="b-serif"
                    style={{ fontSize: 18, fontStyle: i % 2 ? 'italic' : 'normal' }}
                  >
                    {p.name}
                  </div>
                  <div
                    className="b-mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.14em',
                      color: 'var(--b-ink-muted)',
                    }}
                  >
                    NO. 0{i + 1}
                  </div>
                </div>
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
