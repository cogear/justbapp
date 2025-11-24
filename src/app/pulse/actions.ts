'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface DailyPulseInput {
    anxiousCalm: number;
    scatteredFocused: number;
    drainedEnergized: number;
}

export async function saveDailyPulse(data: DailyPulseInput) {
    // TODO: Get real user ID from auth session. 
    // For now, we'll find the first user or create a dummy one if none exists.
    let user = await prisma.user.findFirst();

    if (!user) {
        user = await prisma.user.create({
            data: {
                email: 'demo@justbe.app',
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
