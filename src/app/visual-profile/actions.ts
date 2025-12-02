'use server';

import prisma from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';
import { UserProfile } from '@/lib/visual-profiler/types';
import { assignPersonalityCluster } from '@/lib/personality/clustering';
import { revalidatePath } from 'next/cache';

export async function saveVisualProfile(profile: UserProfile) {
    const stackUser = await stackServerApp.getUser();

    // If not authenticated, return specific status so UI can prompt sign-in
    if (!stackUser) {
        return { success: false, error: 'unauthenticated' };
    }

    try {
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

        // Save the profile
        const scores = {
            openness: Math.round(profile.traits.Openness),
            conscientiousness: Math.round(profile.traits.Conscientiousness),
            extraversion: Math.round(profile.traits.Extraversion),
            agreeableness: Math.round(profile.traits.Agreeableness),
            neuroticism: Math.round(profile.traits.Neuroticism),
        };

        const cluster = assignPersonalityCluster(scores);

        await prisma.visualProfile.create({
            data: {
                userId: user.id,
                ...scores,
                interests: profile.iabInterests.map(i => i.id),
                cluster: cluster.name,
            },
        });

        revalidatePath('/visual-profile');
        return { success: true };
    } catch (error) {
        console.error('Failed to save visual profile:', error);
        return { success: false, error: 'database_error' };
    }
}
