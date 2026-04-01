import { stackServerApp } from '@/lib/stack';
import { notFound } from 'next/navigation';
import { Toaster } from 'sonner';
import React from 'react';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await stackServerApp.getUser();

    // Strict admin check: Only cogear@gmail.com is allowed.
    const isAuthorized = user?.primaryEmail === 'cogear@gmail.com';

    if (!isAuthorized) {
        notFound();
    }

    return (
        <div className="admin-layout">
            <Toaster position="top-right" />
            {children}
        </div>
    );
}
