import { Reveal } from '../motion'
import { Caption } from '../primitives'

export function Specs({ content }) {
  return (
    <section style={{ padding: '140px 56px', background: 'var(--b-paper)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
        <div>
          <Caption style={{ marginBottom: 24 }}>{content.caption}</Caption>
          <h3
            className="b-serif"
            style={{
              fontSize: 84,
              lineHeight: 0.96,
              letterSpacing: '-0.02em',
              fontWeight: 400,
              margin: 0,
            }}
          >
            {content.headline}
            <em style={{ color: 'var(--b-sage)' }}>{content.headlineEm}</em>.
          </h3>
        </div>
        <div style={{ paddingTop: 24 }}>
          {content.items.map(([n, k, v], i) => (
            <Reveal key={i} delay={i * 90} duration={1100} lift={14}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '44px 180px 1fr',
                  gap: 16,
                  padding: '20px 0',
                  borderBottom: '1px solid var(--b-line)',
                  alignItems: 'baseline',
                }}
              >
                <span
                  className="b-serif"
                  style={{ fontStyle: 'italic', color: 'var(--b-clay)', fontSize: 18 }}
                >
                  {n}
                </span>
                <span className="b-serif" style={{ fontSize: 22 }}>
                  {k}
                </span>
                <span style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--b-ink-soft)' }}>
                  {v}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
