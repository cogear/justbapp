import prisma from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { NotificationSettings } from '@/components/messages/notification-settings';

export const dynamic = 'force-dynamic';

export default async function MessageSettingsPage() {
    const stackUser = await stackServerApp.getUser({ or: 'redirect' });
    const user = await prisma.user.findUnique({
        where: { email: stackUser.primaryEmail || '' },
        include: { notificationPreference: true },
    });

    const prefs = user?.notificationPreference;

    return (
        <main className="min-h-screen bg-background py-12 px-6">
            <div className="max-w-2xl mx-auto space-y-8">
                <header className="flex items-center gap-4">
                    <Link
                        href="/messages"
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-full transition-colors"
                        aria-label="Back to messages"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-3xl font-serif font-bold text-foreground">Settings</h1>
                </header>

                <NotificationSettings
                    initialPrefs={{
                        dmEmail: prefs?.dmEmail ?? true,
                        dmSms: prefs?.dmSms ?? false,
                        eventEmail: prefs?.eventEmail ?? true,
                        eventSms: prefs?.eventSms ?? false,
                        announceEmail: prefs?.announceEmail ?? true,
                        announceSms: prefs?.announceSms ?? false,
                    }}
                    phone={user?.phone ?? null}
                    phoneVerified={Boolean(user?.phoneVerifiedAt)}
                    smsAvailable={Boolean(process.env.SENT_API_KEY)}
                />
            </div>
        </main>
    );
}
