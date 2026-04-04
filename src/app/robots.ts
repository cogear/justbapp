import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/', '/handler/', '/sign-in'],
            },
        ],
        sitemap: 'https://theblife.com/sitemap.xml',
    };
}
