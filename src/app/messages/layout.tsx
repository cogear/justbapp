import type { Metadata } from 'next';
import { noindexMetadata } from '@/lib/seo';

// Private member-to-member messaging. Noindex on the page rather than a
// robots.txt Disallow — a disallowed URL is never fetched, so its noindex is
// never seen and it can still be indexed URL-only from inbound links.
export const metadata: Metadata = noindexMetadata('Messages');

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
