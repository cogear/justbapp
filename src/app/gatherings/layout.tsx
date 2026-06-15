import { Toaster } from 'sonner';

export default function GatheringsLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Toaster position="top-right" />
            {children}
        </>
    );
}
