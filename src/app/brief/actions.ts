'use server';

import prisma from '@/lib/prisma';
import { generateDailyEssence } from '@/lib/news/summary';
import { stackServerApp } from '@/lib/stack';

export async function getUserCluster() {
    const stackUser = await stackServerApp.getUser();
    if (!stackUser) return "Global";

    // Find our database user by email
    const user = await prisma.user.findUnique({
        where: { email: stackUser.primaryEmail || '' }
    });

    if (!user) return "Global";

    const profile = await prisma.visualProfile.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
    });

    return profile?.cluster || "Global";
}

export async function getDailySummary(cluster: string = "Global") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if summary exists for the specific cluster
    let summary = await prisma.dailySummary.findUnique({
        where: {
            date_cluster: {
                date: today,
                cluster: cluster
            }
        }
    });

    // If still not found (or if Global was requested and missing), try to generate it
    if (!summary) {
        try {
            // Generate specifically for the requested cluster (or Global)
            summary = await generateDailyEssence(today, cluster);
        } catch (error) {
            console.error(`Failed to generate daily summary for ${cluster}:`, error);
            return null;
        }
    }

    return summary;
}
