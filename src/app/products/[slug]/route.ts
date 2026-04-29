// Serve a published lander page from a pre-rendered HTML file committed
// by egmarket on Publish. The file lives at
// `src/data/landers/<slug>.html` and is fully self-contained — its CSS
// is inlined and its assets reference S3 / Google Fonts directly.
//
// This route has zero runtime dependency on egmarket / thewelist.com.

import { readFile } from 'fs/promises'
import path from 'path'

// Slug allowlist matches what egmarket generates. Belt-and-suspenders
// for path-traversal safety even though Next.js's [slug] param is
// already URL-decoded but not file-system normalized.
const SLUG_RE = /^[a-z0-9-]+$/

export const dynamic = 'force-static'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  if (!SLUG_RE.test(slug)) {
    return new Response('Not found', { status: 404 })
  }

  let html: string
  try {
    html = await readFile(
      path.join(process.cwd(), 'src/data/landers', `${slug}.html`),
      'utf8'
    )
  } catch {
    return new Response('Not found', { status: 404 })
  }

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=31536000, stale-while-revalidate=31536000',
    },
  })
}
