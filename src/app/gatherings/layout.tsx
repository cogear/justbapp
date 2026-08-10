import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { noindexMetadata } from '@/lib/seo';

// Covers /gatherings (redirects anonymous visitors to sign-in) and the
// token-gated /gatherings/invite/[token]. Neither belongs in the index.
export const metadata: Metadata = noindexMetadata('Gatherings');

export default function GatheringsLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Toaster position="top-right" />
            {children}
        </>
    );
}
