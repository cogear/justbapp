import type { Metadata } from 'next';
import { noindexMetadata } from '@/lib/seo';

// page.tsx is a client component and cannot export metadata itself.
export const metadata: Metadata = noindexMetadata('Pulse');

export default function PulseLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
