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

export async function saveInsight(question: string, answer: string, questionId?: string) {
    const stackUser = await stackServerApp.getUser();
    if (!stackUser) throw new Error('User not authenticated');

    const user = await prisma.user.findUnique({
        where: { email: stackUser.primaryEmail || '' },
    });

    if (!user) throw new Error('User not found');

    await prisma.journalEntry.create({
        data: {
            userId: user.id,
            question,
            questionId,
            answer,
        },
    });

    revalidatePath('/insight');
    return { success: true };
}

import { INSIGHT_QUESTIONS } from '@/lib/insight-questions';

export async function getNextQuestion() {
    const stackUser = await stackServerApp.getUser();
    if (!stackUser) return null;

    const user = await prisma.user.findUnique({
        where: { email: stackUser.primaryEmail || '' },
        include: {
            journalEntries: {
                select: { questionId: true },
            },
        },
    });

    if (!user) return INSIGHT_QUESTIONS[0];

    const answeredIds = new Set(user.journalEntries.map(e => e.questionId).filter(Boolean));

    const nextQuestion = INSIGHT_QUESTIONS.find(q => !answeredIds.has(q.id));

    // If all answered, or none found, return a default or the first one (cycling could be added later)
    // For now, let's return a generic fallback if all are answered
    if (!nextQuestion) {
        return {
            id: 'daily_reflection',
            text: "What is one thing you are grateful for today?",
            type: 'text' as const,
            phase: 4
        };
    }

    return nextQuestion;
}
