'use server';

import prisma from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';
import { revalidatePath } from 'next/cache';

export interface DailyPulseInput {
    anxiousCalm: number;
    scatteredFocused: number;
    drainedEnergized: number;
}

export async function saveDailyPulse(data: DailyPulseInput) {
    // Get the authenticated user from Stack Auth
    const stackUser = await stackServerApp.getUser();

    if (!stackUser) {
        throw new Error('User not authenticated');
    }

    // Find or create user in our database
    let user = await prisma.user.findUnique({
        where: { email: stackUser.primaryEmail || '' },
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                email: stackUser.primaryEmail || '',
            },
        });
    }
    await prisma.dailyPulse.create({
        data: {
            userId: user.id,
            anxiousCalm: data.anxiousCalm,
            scatteredFocused: data.scatteredFocused,
            drainedEnergized: data.drainedEnergized,
        },
    });

    revalidatePath('/pulse');
    return { success: true };
}
