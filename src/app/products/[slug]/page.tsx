// Render a published lander page from a JSON payload committed by
// egmarket on Publish. The JSON lives at
// `src/data/landers/<slug>.json` (built into the deploy at build time)
// and is rendered with this site's own copy of the JustBeHumanA
// template. Animations and effects in motion.js run normally because
// this is a real React render at runtime — no static export.
//
// No runtime dependency on egmarket / thewelist.com.

import { notFound } from 'next/navigation'
import { readFile, readdir } from 'fs/promises'
import path from 'path'
import { JustBeHumanA } from '@/components/landers/JustBeHumanA'
import type { ComponentType } from 'react'

// JustBeHumanA is a plain JS module; TypeScript infers its props as
// `never` for assets/content, which collides with the rendered values.
// The template's runtime contract is `{ content, assets, theme }` —
// state that explicitly here so TS doesn't fight us.
type LanderTemplateProps = {
  content: any
  assets: { role: string; imageUrl: string }[]
  theme: string
}

const TEMPLATES: Record<string, ComponentType<LanderTemplateProps>> = {
  'just-be-human-a': JustBeHumanA as ComponentType<LanderTemplateProps>,
}

const LANDERS_DIR = path.join(process.cwd(), 'src/data/landers')

const SLUG_RE = /^[a-z0-9-]+$/

type LanderPayload = {
  schema: number
  slug: string
  name: string
  template: keyof typeof TEMPLATES
  publishedAt: string
  content: any
  assets: { role: string; imageUrl: string }[]
}

async function loadLander(slug: string): Promise<LanderPayload | null> {
  if (!SLUG_RE.test(slug)) return null
  try {
    const raw = await readFile(path.join(LANDERS_DIR, `${slug}.json`), 'utf8')
    return JSON.parse(raw) as LanderPayload
  } catch {
    return null
  }
}

export async function generateStaticParams() {
  // Pre-render every published lander at build time. New publishes
  // trigger a Vercel rebuild, which picks up new files in this dir.
  try {
    const files = await readdir(LANDERS_DIR)
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => ({ slug: f.replace(/\.json$/, '') }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const lander = await loadLander(slug)
  return { title: lander?.name ?? 'Not found' }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const lander = await loadLander(slug)
  if (!lander) notFound()

  const Template = TEMPLATES[lander.template]
  if (!Template) notFound()

  return <Template content={lander.content} assets={lander.assets} theme="light" />
}
