import type { Metadata } from 'next';
import { noindexMetadata } from '@/lib/seo';

// page.tsx is a client component and cannot export metadata itself. The submit
// form is a utility page, not a landing page — keep it out of the index while
// leaving /events fully indexable.
export const metadata: Metadata = noindexMetadata('Submit an Event');

export default function SubmitEventLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
