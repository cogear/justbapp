'use server';

import prisma from '@/lib/prisma';
import OpenAI from 'openai';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { scrapeHub } from '@/lib/events/ingestion';

function getOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not set');
    }
    return new OpenAI({ apiKey });
}

export interface DiscoveredSource {
    name: string;
    url: string;
    type: 'Library' | 'Government' | 'Community' | 'Other';
}

export async function discoverSources(formData: FormData): Promise<DiscoveredSource[]> {
    const location = formData.get('location') as string;

    if (!location) return [];

    const openai = getOpenAI();

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are a helpful assistant that finds local event sources.
                    Given a City, State (e.g. "Melbourne, FL"), return a JSON object with a key "sources" containing an array of likely event calendar URLs for that location.
                    Focus on:
                    1. Public Libraries (Events/Calendar pages)
                    2. Parks & Recreation Departments
                    3. City Government Calendars
                    4. Community Centers
                    
                    Do NOT invent fake URLs if you can avoid it, but educated guesses for standard patterns (e.g. libcal) are okay.
                    
                    Format:
                    {
                        "sources": [
                            { "name": "Melbourne Public Library", "url": "...", "type": "Library" }
                        ]
                    }`
                },
                {
                    role: "user",
                    content: `Find event sources for: ${location}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content || '{}');
        return result.sources || [];
    } catch (error) {
        console.error('Discovery error:', error);
        return [];
    }
}

export async function addSource(formData: FormData) {
    const name = formData.get('name') as string;
    const url = formData.get('url') as string;

    if (!name || !url) return;

    try {
        await prisma.eventSource.create({
            data: {
                name,
                url,
                parserType: 'HTML_LLM', // Default to LLM parser
            }
        });
        revalidatePath('/admin/sources');
    } catch (error) {
        console.error('Failed to add source:', error);
    }
}

export async function updateSource(formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const url = formData.get('url') as string;

    if (!id || !name || !url) return;

    try {
        await prisma.eventSource.update({
            where: { id },
            data: {
                name,
                url,
            }
        });
        revalidatePath('/admin/sources');
        redirect('/admin/sources');
    } catch (error) {
        console.error('Failed to update source:', error);
        throw error;
    }
}

export async function deleteSource(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) return;

    try {
        await prisma.eventSource.delete({ where: { id } });
        revalidatePath('/admin/sources');
    } catch (error) {
        console.error('Failed to delete source:', error);
    }
}



export async function triggerScrape(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) return;

    try {
        // Note: In a real app, this should be a background job
        await scrapeHub(id);
        revalidatePath('/admin/sources');
        revalidatePath('/admin/events');
    } catch (error) {
        console.error('Failed to trigger scrape:', error);
    }
}
