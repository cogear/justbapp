import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

/**
 * Disallow is only for URLs that should never be fetched at all — admin, API,
 * auth plumbing, and private/token-gated paths.
 *
 * Routes that merely shouldn't be *indexed* (/news, /gatherings, /getout,
 * /brief, /insight, /pulse, /visual-profile) are deliberately NOT listed here.
 * They're linked from the site nav, and a disallowed URL is never crawled — so
 * its page-level `noindex` is never seen, and Google can still index it URL-only
 * from those inbound links ("Indexed, though blocked by robots.txt"). Page-level
 * noindex via `noindexMetadata()` is the right tool for those.
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/api/',
                    '/handler/',
                    '/sign-in',
                    '/messages/',
                    '/invite/',
                    '/gatherings/invite/',
                    '/newsletter/',
                    '/lens/',
                ],
            },
        ],
        sitemap: absoluteUrl('/sitemap.xml'),
    };
}
