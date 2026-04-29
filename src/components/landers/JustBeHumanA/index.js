import './tokens.css'
import { DEFAULT_CONTENT } from './defaults'
import { PRODUCTS } from './primitives'
import { Hero } from './beats/Hero'
import { Why } from './beats/Why'
import { Detail } from './beats/Detail'
import { Worn } from './beats/Worn'
import { Variants } from './beats/Variants'
import { Specs } from './beats/Specs'
import { Close } from './beats/Close'

const A_W = 1280

// Deep-merge plain objects so nested keys like `close.sticky.price` survive
// when a lander only stores `close.sticky.name`. Arrays replace wholesale.
function deepMerge(base, override) {
  if (override === null || override === undefined) return base
  if (typeof override !== 'object' || Array.isArray(override)) return override
  if (typeof base !== 'object' || base === null || Array.isArray(base)) {
    return { ...override }
  }
  const out = { ...base }
  for (const k of Object.keys(override)) {
    out[k] = deepMerge(base[k], override[k])
  }
  return out
}

function mergeContent(stored) {
  return deepMerge(DEFAULT_CONTENT, stored || {})
}

export function JustBeHumanA({ content: storedContent, assets = [], theme = 'light' }) {
  const content = mergeContent(storedContent)
  const assetByRole = Object.fromEntries(assets.map((a) => [a.role, a.imageUrl]))

  // Allow per-lander variant overrides while preserving the canonical order.
  const products = (content.products || PRODUCTS).map((p) => ({ ...p }))

  return (
    <div
      className="lander-justbehuman"
      data-theme={theme === 'dark' ? 'dark' : 'light'}
      style={{
        width: A_W,
        margin: '0 auto',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: '28px 56px 24px',
          borderBottom: '1px solid var(--b-ink)',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        <div className="b-serif" style={{ fontSize: 13, letterSpacing: '0.04em', textTransform: 'none' }}>
          <em>{content.masthead.volLabel}</em>
        </div>
        <div className="b-serif" style={{ fontSize: 32, letterSpacing: '0', textTransform: 'none' }}>
          {content.masthead.logoLeft}
          <span style={{ color: 'var(--b-clay)' }}>{content.masthead.logoDot}</span>
        </div>
        <div style={{ textAlign: 'right' }}>{content.masthead.domain}</div>
      </div>

      <Hero content={content.hero} assetByRole={assetByRole} />
      <Why content={content.why} assetByRole={assetByRole} />
      <Detail content={content.detail} assetByRole={assetByRole} products={products} />
      <Worn content={content.worn} assetByRole={assetByRole} products={products} />
      <Variants content={content.variants} assetByRole={assetByRole} products={products} />
      <Specs content={content.specs} />
      <Close content={content.close} assetByRole={assetByRole} products={products} />

      <div
        style={{
          borderTop: '1px solid var(--b-ink)',
          padding: '24px 56px',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          background: 'var(--b-sand)',
        }}
      >
        <div
          className="b-serif"
          style={{ textTransform: 'none', letterSpacing: 0, fontStyle: 'italic' }}
        >
          {content.footer.left}
        </div>
        <div>{content.footer.center}</div>
        <div style={{ textAlign: 'right' }} className="b-serif">
          <em>{content.footer.right}</em>
        </div>
      </div>
    </div>
  )
}
