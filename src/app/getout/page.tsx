import { stackServerApp } from '@/lib/stack';
import prisma from '@/lib/prisma';
import { getEvents } from './actions';
import GetOutClient from './client';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function GetOutPage() {
    const stackUser = await stackServerApp.getUser();
    if (!stackUser) {
        redirect('/sign-in');
    }

    const user = await prisma.user.findUnique({
        where: { email: stackUser.primaryEmail || '' }
    });

    const userZip = user?.zipCode || null;
    let initialEvents: any[] = [];

    if (userZip) {
        initialEvents = await getEvents(userZip);
    }

    return (
        <GetOutClient
            initialZip={userZip}
            initialEvents={initialEvents}
        />
    );
}
