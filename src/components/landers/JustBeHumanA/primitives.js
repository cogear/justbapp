// Primitives ported from docs/just-be-lander/project/shared.jsx.
// Pure presentational — safe in both server and client components.

export const PRODUCTS = [
  { id: 'cream',   name: 'Cream & Hot Pink', bg: '#E8DDC8', textColor: '#D14B7C' },
  { id: 'tan',     name: 'Tan & Wine',       bg: '#D8C5A6', textColor: '#5A2738' },
  { id: 'mauve',   name: 'Mauve & Forest',   bg: '#C29A98', textColor: '#3F4F4D' },
  { id: 'autumn',  name: 'Autumn and Plum',  bg: '#C58457', textColor: '#3D2E63' },
  { id: 'maroon',  name: 'Maroon & Sage',    bg: '#7B2A36', textColor: '#8DA399' },
  { id: 'slate',   name: 'Slate & Rust',     bg: '#506D7C', textColor: '#E08A60' },
  { id: 'emerald', name: 'Emerald & Peach',  bg: '#1F3A2C', textColor: '#E2B58A' },
  { id: 'brown',   name: 'Brown & Butter',   bg: '#5C4632', textColor: '#E8D8A8' },
]

export function Img({ label = 'image', bg, ratio, h, w, style, className = '' }) {
  return (
    <div
      className={`b-img ${className}`}
      data-label={label}
      style={{
        '--bg': bg || '#E8E1D2',
        width: w || '100%',
        height: h || 'auto',
        aspectRatio: ratio,
        ...style,
      }}
    />
  )
}

export function Shirt({ src, bg = 'var(--b-paper)', h, w, pad = 0, style, fit = 'contain', className = '', rounded = 0 }) {
  return (
    <div
      className={className}
      style={{
        width: w || '100%',
        height: h || 'auto',
        background: bg,
        borderRadius: rounded,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: pad,
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: fit, display: 'block' }}
        />
      ) : (
        <div
          className="b-mono"
          style={{ fontSize: 11, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase' }}
        >
          shirt asset missing
        </div>
      )}
    </div>
  )
}

export function PhotoBrief({ label, sub, h = 460, bg = '#D8CFBC', className = '', style }) {
  return (
    <div
      className={`b-img ${className}`}
      style={{
        '--bg': bg,
        height: h,
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        padding: 22,
        position: 'relative',
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: 'ui-monospace, Menlo, monospace',
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(45,45,45,0.55)',
          marginBottom: 6,
        }}
      >
        shot · to be photographed
      </div>
      <div
        style={{
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          fontSize: 16,
          lineHeight: 1.4,
          color: 'rgba(45,45,45,0.85)',
          maxWidth: '85%',
        }}
      >
        {label}
      </div>
      {sub && (
        <div
          style={{
            fontFamily: 'ui-monospace, Menlo, monospace',
            fontSize: 10,
            letterSpacing: '0.14em',
            color: 'rgba(45,45,45,0.45)',
            marginTop: 6,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  )
}

export function Pill({ children, dark = true, style }) {
  return (
    <span
      className="b-sans"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '16px 28px',
        borderRadius: 999,
        background: dark ? 'var(--b-night)' : 'transparent',
        color: dark ? 'var(--b-sand)' : 'var(--b-ink)',
        border: dark ? 'none' : '1px solid var(--b-ink)',
        fontSize: 14,
        letterSpacing: '0.02em',
        ...style,
      }}
    >
      {children}
    </span>
  )
}

export function Caption({ children, style }) {
  return (
    <div
      className="b-mono"
      style={{
        fontSize: 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--b-ink-muted)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
