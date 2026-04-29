'use client'

import { useEffect, useRef, useState, Children } from 'react'

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v))

const _subs = new Set()
let _running = false
const _tick = () => {
  if (typeof window === 'undefined') return
  const vh = window.innerHeight
  const vw = window.innerWidth
  for (const fn of _subs) fn(vh, vw)
  if (_subs.size > 0) requestAnimationFrame(_tick)
  else _running = false
}
const subscribe = (fn) => {
  _subs.add(fn)
  if (!_running) {
    _running = true
    requestAnimationFrame(_tick)
  }
  return () => _subs.delete(fn)
}

export function Reveal({ children, delay = 0, lift = 18, duration = 1400, as: Tag = 'div', style, ...rest }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true)
            io.disconnect()
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return (
    <Tag
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : `translateY(${lift}px)`,
        transition: `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: 'opacity, transform',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export function Parallax({ children, rate = -0.12, style, ...rest }) {
  const ref = useRef(null)
  const innerRef = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    return subscribe((vh) => {
      const el = ref.current
      if (!el || !innerRef.current) return
      const r = el.getBoundingClientRect()
      const center = r.top + r.height / 2 - vh / 2
      const offset = center * rate
      innerRef.current.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`
    })
  }, [rate])
  return (
    <div ref={ref} style={{ ...style }} {...rest}>
      <div ref={innerRef} style={{ willChange: 'transform' }}>
        {children}
      </div>
    </div>
  )
}

export function KenBurns({
  children,
  from = { scale: 1.06, x: -2, y: -2 },
  to = { scale: 1.14, x: 2, y: 2 },
  style,
  ...rest
}) {
  const ref = useRef(null)
  const innerRef = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    return subscribe((vh) => {
      const el = ref.current
      if (!el || !innerRef.current) return
      const r = el.getBoundingClientRect()
      const startY = vh * 1.0
      const endY = -r.height
      const raw = (startY - r.top) / (startY - endY)
      const t = easeInOutCubic(clamp(raw, 0, 1))
      const s = from.scale + (to.scale - from.scale) * t
      const x = from.x + (to.x - from.x) * t
      const y = from.y + (to.y - from.y) * t
      innerRef.current.style.transform = `scale(${s.toFixed(4)}) translate(${x.toFixed(2)}%, ${y.toFixed(2)}%)`
    })
  }, [from.scale, to.scale, from.x, to.x, from.y, to.y])
  return (
    <div ref={ref} style={{ overflow: 'hidden', ...style }} {...rest}>
      <div
        ref={innerRef}
        style={{ width: '100%', height: '100%', willChange: 'transform', transformOrigin: 'center' }}
      >
        {children}
      </div>
    </div>
  )
}

export function StackedPoem({ lines, delay = 0, baseDelay = 220, style, lineStyle }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true)
            io.disconnect()
          }
        }
      },
      { threshold: 0.2 }
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return (
    <h1 ref={ref} style={style}>
      {lines.map((line, i) => (
        <span
          key={i}
          style={{
            display: 'block',
            opacity: shown ? 1 : 0,
            transform: shown ? 'translateY(0)' : 'translateY(28px)',
            transition: `opacity 1600ms cubic-bezier(0.22,1,0.36,1) ${delay + i * baseDelay}ms, transform 1600ms cubic-bezier(0.22,1,0.36,1) ${delay + i * baseDelay}ms`,
            willChange: 'opacity, transform',
            ...(typeof line === 'object' ? line.style : null),
            ...lineStyle,
          }}
        >
          {typeof line === 'object' ? line.text : line}
        </span>
      ))}
    </h1>
  )
}

export function CrossfadeFrames({ children, interval = 2600, fade = 1100, style }) {
  const items = Children.toArray(children)
  const ref = useRef(null)
  const [idx, setIdx] = useState(0)
  const [active, setActive] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setActive(e.isIntersecting)
      },
      { threshold: 0.1 }
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (!active || items.length <= 1) return
    const id = setInterval(() => setIdx((i) => (i + 1) % items.length), interval)
    return () => clearInterval(id)
  }, [active, items.length, interval])
  return (
    <div ref={ref} style={{ position: 'relative', ...style }}>
      {items.map((child, i) => (
        <div
          key={i}
          style={{
            position: i === 0 ? 'relative' : 'absolute',
            inset: 0,
            opacity: i === idx ? 1 : 0,
            transition: `opacity ${fade}ms ease-in-out`,
            willChange: 'opacity',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

export function MaskReveal({ children, delay = 0, duration = 1400, as: Tag = 'span', style, ...rest }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true)
            io.disconnect()
          }
        }
      },
      { threshold: 0.01, rootMargin: '0px 0px -5% 0px' }
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return (
    <Tag
      ref={ref}
      style={{
        display: 'inline-block',
        overflow: 'hidden',
        verticalAlign: 'top',
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          display: 'inline-block',
          transform: shown ? 'translateY(0)' : 'translateY(105%)',
          transition: `transform ${duration}ms cubic-bezier(0.7,0,0.3,1) ${delay}ms`,
          willChange: 'transform',
        }}
      >
        {children}
      </span>
    </Tag>
  )
}

export function PunchIn({ children, delay = 0, duration = 1100, style, ...rest }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true)
            io.disconnect()
          }
        }
      },
      { threshold: 0.25 }
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        filter: shown ? 'blur(0px)' : 'blur(6px)',
        transform: shown ? 'scale(1)' : 'scale(1.06)',
        transition: `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, filter ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: 'opacity, filter, transform',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
