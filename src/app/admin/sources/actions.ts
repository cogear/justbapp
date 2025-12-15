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

async function verifyUrl(url: string): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Bot/1.0)'
            }
        });
        clearTimeout(timeoutId);

        if (response.ok) return true;

        // If HEAD fails (some servers block it), try GET
        if (response.status === 405 || response.status === 403) {
            const controllerGet = new AbortController();
            const timeoutIdGet = setTimeout(() => controllerGet.abort(), 5000);

            const responseGet = await fetch(url, {
                method: 'GET',
                signal: controllerGet.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; Bot/1.0)'
                }
            });
            clearTimeout(timeoutIdGet);
            return responseGet.ok;
        }

        return false;
    } catch (error) {
        return false;
    }
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
        const sources: DiscoveredSource[] = result.sources || [];

        // Verify URLs in parallel
        const verifiedSources: DiscoveredSource[] = [];
        await Promise.all(sources.map(async (source) => {
            const isValid = await verifyUrl(source.url);
            if (isValid) {
                verifiedSources.push(source);
            } else {
                console.log(`[Discovery] Dropped invalid URL: ${source.url}`);
            }
        }));

        return verifiedSources;
    } catch (error) {
        console.error('Discovery error:', error);
        return [];
    }
}

async function performScrape(sourceId: string) {
    try {
        const { scrapeHub } = await import('@/lib/events/ingestion');
        const result = await scrapeHub(sourceId);

        const status = result.added > 0 ? "SUCCESS" : "WARNING";

        await prisma.eventSource.update({
            where: { id: sourceId },
            data: {
                lastScrapedAt: new Date(),
                lastScrapeStatus: status,
                lastScrapeLog: `Success: Found ${result.found}, Added ${result.added}`
            }
        });
        return true;
    } catch (error: any) {
        console.error(`Failed to scrape source ${sourceId}:`, error);
        await prisma.eventSource.update({
            where: { id: sourceId },
            data: {
                lastScrapeStatus: "FAILED",
                lastScrapeLog: error.message || "Unknown error"
            }
        });
        return false;
    }
}

export async function discoverSources(formData: FormData): Promise<DiscoveredSource[]> {
    const location = formData.get('location') as string;
    if (!location) return [];
    return await fetchSourcesFromLLM(location);
}

export async function discoverAndAddSources(formData: FormData): Promise<{ source: DiscoveredSource, isNew: boolean }[]> {
    const location = formData.get('location') as string;
    if (!location) return [];

    const discovered = await fetchSourcesFromLLM(location);
    const results: { source: DiscoveredSource, isNew: boolean }[] = [];

    // Fetch existing URLs to check for duplicates
    const allSources = await prisma.eventSource.findMany({ select: { url: true } });
    const existingUrls = new Set(allSources.map(s => normalizeUrl(s.url)));

    for (const src of discovered) {
        const normalized = normalizeUrl(src.url);
        if (!existingUrls.has(normalized)) {
            const newSource = await prisma.eventSource.create({
                data: {
                    name: src.name,
                    url: src.url,
                    parserType: 'HTML_LLM',
                    status: 'ACTIVE',
                    lastScrapeLog: `Discovered for ${location}`
                }
            });
            existingUrls.add(normalized);

            // Auto-scrape the new source
            await performScrape(newSource.id);

            results.push({ source: src, isNew: true });
        } else {
            results.push({ source: src, isNew: false });
        }
    }

    revalidatePath('/admin/sources');
    return results;
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
                const newSource = await prisma.eventSource.create({
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

                // Auto-scrape the new source
                await performScrape(newSource.id);
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

        await performScrape(id);

        revalidatePath('/admin/sources');
        revalidatePath('/admin/events');
    } catch (error: any) {
        console.error('Failed to trigger scrape:', error);
    }
}

export async function runBatchScrape() {
    const sources = await prisma.eventSource.findMany({
        where: { status: "ACTIVE" }
    });

    console.log(`[Bot] Starting batch scrape for ${sources.length} sources...`);

    for (const source of sources) {
        console.log(`[Bot] Scraping ${source.name}...`);
        await performScrape(source.id);
    }

    revalidatePath('/admin/sources');
}
