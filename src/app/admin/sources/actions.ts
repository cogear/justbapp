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

async function fetchSourcesFromLLM(location: string): Promise<DiscoveredSource[]> {
    const openai = getOpenAI();

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
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

export async function discoverSources(formData: FormData): Promise<DiscoveredSource[]> {
    const location = formData.get('location') as string;
    if (!location) return [];
    return await fetchSourcesFromLLM(location);
}

export async function runBatchDiscovery() {
    const locations = ["Melbourne, FL", "Palm Bay, FL", "Cocoa Beach, FL", "Viera, FL", "Brevard County, FL"];
    console.log(`[Bot] Starting discovery for ${locations.length} locations...`);

    // Fetch all existing URLs to check for duplicates efficiently
    const allSources = await prisma.eventSource.findMany({ select: { url: true } });
    const existingUrls = new Set(allSources.map(s => normalizeUrl(s.url)));

    let newCount = 0;

    for (const location of locations) {
        console.log(`[Bot] Searching for sources in ${location}...`);
        const sources = await fetchSourcesFromLLM(location);

        for (const src of sources) {
            const normalized = normalizeUrl(src.url);

            if (!existingUrls.has(normalized)) {
                await prisma.eventSource.create({
                    data: {
                        name: src.name,
                        url: src.url,
                        parserType: 'HTML_LLM',
                        status: 'ACTIVE',
                        lastScrapeLog: `Discovered via Bot for ${location}`
                    }
                });
                existingUrls.add(normalized); // Add to set to prevent duplicates within the same run
                newCount++;
                console.log(`[Bot] Found NEW source: ${src.name}`);
            } else {
                console.log(`[Bot] Skipping duplicate: ${src.name} (${src.url})`);
            }
        }
    }

    revalidatePath('/admin/sources');
}

function normalizeUrl(url: string): string {
    try {
        // Remove protocol
        let normalized = url.toLowerCase().replace(/^https?:\/\//, '');
        // Remove www.
        normalized = normalized.replace(/^www\./, '');
        // Remove trailing slash
        if (normalized.endsWith('/')) {
            normalized = normalized.slice(0, -1);
        }
        return normalized;
    } catch (e) {
        return url.toLowerCase();
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
        const source = await prisma.eventSource.findUnique({ where: { id } });
        if (!source) throw new Error("Source not found");

        // Call the ingestion logic
        // We need to dynamically import to avoid circular deps if any, but standard import is fine here usually
        // However, ingestion might need to be server-side only
        const { scrapeHub } = await import('@/lib/events/ingestion');
        await scrapeHub(source.id);

        await prisma.eventSource.update({
            where: { id },
            data: {
                lastScrapedAt: new Date(),
                lastScrapeStatus: "SUCCESS",
                lastScrapeLog: "Manual trigger successful"
            }
        });

        revalidatePath('/admin/sources');
        revalidatePath('/admin/events');
    } catch (error: any) {
        console.error('Failed to trigger scrape:', error);
        await prisma.eventSource.update({
            where: { id },
            data: {
                lastScrapeStatus: "FAILED",
                lastScrapeLog: error.message || "Unknown error"
            }
        });
    }
}

export async function runBatchScrape() {
    const sources = await prisma.eventSource.findMany({
        where: { status: "ACTIVE" }
    });

    console.log(`[Bot] Starting batch scrape for ${sources.length} sources...`);

    for (const source of sources) {
        try {
            console.log(`[Bot] Scraping ${source.name}...`);
            const { scrapeHub } = await import('@/lib/events/ingestion');
            await scrapeHub(source.id);

            await prisma.eventSource.update({
                where: { id: source.id },
                data: {
                    lastScrapedAt: new Date(),
                    lastScrapeStatus: "SUCCESS",
                    lastScrapeLog: "Batch scrape successful"
                }
            });
        } catch (error: any) {
            console.error(`[Bot] Failed to scrape ${source.name}:`, error);
            await prisma.eventSource.update({
                where: { id: source.id },
                data: {
                    lastScrapeStatus: "FAILED",
                    lastScrapeLog: error.message || "Unknown error"
                }
            });
        }
    }

    revalidatePath('/admin/sources');
}
