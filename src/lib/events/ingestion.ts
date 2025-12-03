import prisma from '@/lib/prisma';
import OpenAI from 'openai';
import * as cheerio from 'cheerio';
import { Event } from '@prisma/client';
import { geocodeAddress } from '@/lib/events/geocoding';

// Lazy init OpenAI
function getOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not set');
    }
    return new OpenAI({ apiKey });
}

interface ExtractedEvent {
    title: string;
    description: string;
    startTime: string; // ISO string
    endTime?: string; // ISO string
    locationName?: string;
    address?: string;
    category?: string;
}

// Keyword-based categorization
export function categorizeEvent(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();

    const categories: Record<string, string[]> = {
        'Social': ['party', 'meet', 'social', 'mixer', 'dance', 'festival', 'celebration', 'gala', 'networking', 'club'],
        'Creative': ['art', 'craft', 'paint', 'draw', 'music', 'concert', 'performance', 'exhibition', 'write', 'poetry', 'theater', 'comedy', 'show', 'film', 'movie'],
        'Active': ['run', 'walk', 'yoga', 'fitness', 'hike', 'sport', 'dance', 'exercise', 'workout', 'gym', 'pilates', 'meditation', 'taichi'],
        'Intellectual': ['learn', 'class', 'workshop', 'lecture', 'talk', 'book', 'study', 'history', 'science', 'tech', 'coding', 'seminar', 'course', 'training'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(k => text.includes(k))) {
            return category;
        }
    }

    return 'Community'; // Default
}

// Heuristic to extract events directly from JSON
function tryExtractEventsFromJson(json: any, defaultLocation?: string): ExtractedEvent[] | null {
    try {
        let eventArray: any[] = [];

        // 1. Find the array
        if (Array.isArray(json)) {
            eventArray = json;
        } else if (typeof json === 'object' && json !== null) {
            // Look for a property that is an array
            for (const key in json) {
                if (Array.isArray(json[key]) && json[key].length > 0) {
                    // Check if the first item looks like an event
                    const first = json[key][0];
                    if (first && (first.title || first.name || first.eventName || first.summary)) {
                        eventArray = json[key];
                        break;
                    }
                }
            }
        }

        if (eventArray.length === 0) return null;

        console.log(`Found potential event array with ${eventArray.length} items.`);

        // 2. Map items
        const events: ExtractedEvent[] = [];
        for (const item of eventArray) {
            // Basic validation: needs a title and a date
            const title = item.title || item.name || item.eventName || item.summary || item.headline;
            const start = item.start || item.startDate || item.startTime || item.begin || item.date;

            if (!title || !start) continue;

            // Description
            let description = item.description || item.desc || item.summary || '';
            // Clean HTML from description if present
            if (typeof description === 'string' && description.includes('<')) {
                description = description.replace(/<[^>]*>/g, '');
            }

            // Location
            let location = '';
            if (typeof item.location === 'string') location = item.location;
            else if (typeof item.location === 'object') {
                location = item.location.address || item.location.name || item.location.fullAddress || '';
            } else if (item.extendedProps?.Location) {
                // Specific to the Brevard example, but generic enough to check extendedProps
                const loc = item.extendedProps.Location;
                location = loc.FullAddress || loc.Address || loc.LocationName || '';
            }

            // Fallback to default location if none found
            if (!location && defaultLocation) {
                location = defaultLocation;
            }

            events.push({
                title,
                description,
                startTime: start,
                address: location,
                locationName: location, // Use same string for name for now
                category: categorizeEvent(title, description)
            });
        }

        if (events.length > 0) {
            console.log(`Successfully heuristically mapped ${events.length} events from JSON.`);
            return events;
        }

    } catch (e) {
        console.error('Error in heuristic JSON extraction:', e);
    }
    return null;
}

// Helper to extract events from HTML using LLM
async function extractEventsFromHtml(html: string, sourceName: string, additionalContext: string = '', defaultLocation?: string): Promise<ExtractedEvent[]> {
    const $ = cheerio.load(html);
    $('script').remove();
    $('style').remove();
    $('nav').remove();
    $('footer').remove();
    $('header').remove();
    $('svg').remove();
    $('[style*="display: none"]').remove();

    let bodyText = $('body').text().replace(/\s+/g, ' ').substring(0, 100000);

    if (additionalContext) {
        console.log(`Injecting ${additionalContext.length} chars of JSON context.`);
        bodyText = `*** IMPORTANT: RAW JSON DATA FROM API ***\n${additionalContext}\n\n*** END JSON DATA ***\n\n${bodyText}`;
    }

    console.log(`Extracted ${bodyText.length} chars of text for LLM.`);
    const openai = getOpenAI();

    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: `You are an event extraction engine. Your goal is to extract local community events from the provided webpage text and raw JSON data.
                
                CRITICAL INSTRUCTION: Extract EVERY single event found. The text may contain a raw JSON dump of events - PRIORTIZE this data as it is the most accurate.
                
                Return a JSON object with a key "events" containing an array of events.
                Each event must have:
                - title: string
                - description: string (brief summary)
                - startTime: ISO 8601 string (assume current year ${new Date().getFullYear()} if not specified, and use local time of the library)
                - endTime: ISO 8601 string (optional, estimate 1 hour if unknown)
                - locationName: string (e.g. "Main Library Meeting Room")
                - address: string (full address if possible)
                - category: One of ["Social", "Creative", "Active", "Intellectual", "Community"]
                
                CRITICAL: All events MUST have an address. 
                - If the address is explicitly listed, use it.
                - If the address is NOT listed, try to infer it from the page context (e.g. if the page is for "Brevard Library", use that address).
                - If you absolutely cannot find an address, leave it empty string.
                
                Ignore generic announcements like "Library Closed" or "Weekly Hours". Focus on specific events like "Story Time", "Book Club", "Yoga Class".`
            },
            {
                role: "user",
                content: `Source Context: ${sourceName}\nDefault Location: ${defaultLocation || 'None'}\n\n${bodyText}`
            }
        ],
        response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    const events = result.events || [];

    // Post-process to ensure address fallback
    return events.map((e: any) => ({
        ...e,
        address: e.address || defaultLocation || '',
        locationName: e.locationName || defaultLocation || ''
    }));
}

export async function scrapeHub(sourceId: string) {
    const source = await prisma.eventSource.findUnique({
        where: { id: sourceId },
    });

    if (!source) {
        throw new Error(`EventSource ${sourceId} not found`);
    }

    console.log(`\n--- Scraping Hub: ${source.name} (${source.url}) ---`);

    let events: ExtractedEvent[] = [];

    try {
        // 1. Try standard Fetch
        const response = await fetch(source.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.google.com/',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'max-age=0',
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ${source.url}: ${response.statusText}`);
        }

        const html = await response.text();
        events = await extractEventsFromHtml(html, source.name, '', source.name);
        console.log(`Standard Fetch Found ${events.length} events.`);

        // 2. Fallback / Enhancement: If few events found (likely just one page), try Puppeteer for pagination
        if (events.length < 20) {
            console.log(`Standard fetch found ${events.length} events. Retrying with Headless Browser to check for pagination...`);
            const { scrapeDynamicContent } = await import('./browser');
            const { pages, json: capturedJson } = await scrapeDynamicContent(source.url);

            console.log(`Headless Browser captured ${pages.length} pages and ${capturedJson.length} JSON responses.`);

            // Try heuristic extraction first on all captured JSONs
            for (const capture of capturedJson) {
                const directEvents = tryExtractEventsFromJson(capture.data, source.name);
                if (directEvents && directEvents.length > 0) {
                    console.log('Direct JSON mapping successful! Skipping LLM.');
                    events = [...events, ...directEvents];
                }
            }

            if (events.length > 20) {
                console.log(`Returning ${events.length} events from direct JSON mapping.`);
            } else {
                console.log('Direct mapping yielded few events. Falling back to LLM extraction with batching.');

                let jsonContext = '';
                if (capturedJson.length > 0) {
                    // Limit total JSON context to avoid token overflow
                    // Take top 3 largest JSONs, truncate each to 10k chars
                    jsonContext = capturedJson
                        .filter(j => JSON.stringify(j.data).length > 500)
                        .sort((a, b) => JSON.stringify(b.data).length - JSON.stringify(a.data).length)
                        .slice(0, 3)
                        .map(j => JSON.stringify(j.data).substring(0, 10000))
                        .join('\n\n');
                }

                // Batch processing for pages
                const BATCH_SIZE = 3;
                for (let i = 0; i < pages.length; i += BATCH_SIZE) {
                    const batchPages = pages.slice(i, i + BATCH_SIZE);
                    const batchHtml = batchPages.join('\n\n<!-- NEXT PAGE -->\n\n');
                    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(pages.length / BATCH_SIZE)}...`);

                    // Only inject JSON context in the first batch to save tokens
                    const contextToInject = i === 0 ? jsonContext : '';

                    const llmEvents = await extractEventsFromHtml(batchHtml, source.name, contextToInject, source.name);
                    events = [...events, ...llmEvents];
                }
            }
            console.log(`Headless Browser Found ${events.length} total events.`);
        }

    } catch (error) {
        console.error(`Error scraping ${source.name}:`, error);

        // 3. Error Fallback: Try Puppeteer if fetch failed
        try {
            console.log('Fetch failed. Retrying with Headless Browser...');
            const { scrapeDynamicContent } = await import('./browser');
            const { pages, json: capturedJson } = await scrapeDynamicContent(source.url);

            console.log(`Headless Browser captured ${pages.length} pages.`);

            for (const capture of capturedJson) {
                const directEvents = tryExtractEventsFromJson(capture.data, source.name);
                if (directEvents && directEvents.length > 0) {
                    events = [...events, ...directEvents];
                }
            }

            if (events.length > 20) {
                console.log(`Returning ${events.length} events from direct JSON mapping (error fallback).`);
            } else {
                let jsonContext = '';
                if (capturedJson.length > 0) {
                    // Limit total JSON context to avoid token overflow
                    // Take top 3 largest JSONs, truncate each to 10k chars
                    jsonContext = capturedJson
                        .filter(j => JSON.stringify(j.data).length > 500)
                        .sort((a, b) => JSON.stringify(b.data).length - JSON.stringify(a.data).length)
                        .slice(0, 3)
                        .map(j => JSON.stringify(j.data).substring(0, 10000))
                        .join('\n\n');
                }

                const BATCH_SIZE = 3;
                for (let i = 0; i < pages.length; i += BATCH_SIZE) {
                    const batchPages = pages.slice(i, i + BATCH_SIZE);
                    const batchHtml = batchPages.join('\n\n<!-- NEXT PAGE -->\n\n');
                    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(pages.length / BATCH_SIZE)} (fallback)...`);

                    // Only inject JSON context in the first batch to save tokens
                    const contextToInject = i === 0 ? jsonContext : '';

                    const llmEvents = await extractEventsFromHtml(batchHtml, source.name, contextToInject, source.name);
                    events = [...events, ...llmEvents];
                }
            }
            console.log(`Headless Browser Found ${events.length} total events (after error).`);
        } catch (puppeteerError) {
            console.error('Puppeteer also failed:', puppeteerError);
            return;
        }
    }

    // 4. Save & Deduplicate
    let addedCount = 0;
    for (const ev of events) {
        const existing = await prisma.event.findFirst({
            where: {
                title: { equals: ev.title, mode: 'insensitive' },
                startTime: {
                    gte: new Date(new Date(ev.startTime).getTime() - 24 * 60 * 60 * 1000),
                    lte: new Date(new Date(ev.startTime).getTime() + 24 * 60 * 60 * 1000),
                }
            }
        });

        if (!existing) {
            let latitude: number | null = null;
            let longitude: number | null = null;

            const addressToGeocode = ev.address || (ev.locationName ? `${ev.locationName}, ${source.name}` : null);

            if (addressToGeocode) {
                const geo = await geocodeAddress(addressToGeocode);
                if (geo) {
                    latitude = geo.latitude;
                    longitude = geo.longitude;
                }
            }

            await prisma.event.create({
                data: {
                    title: ev.title,
                    description: ev.description || ev.title,
                    startTime: new Date(ev.startTime),
                    endTime: ev.endTime ? new Date(ev.endTime) : undefined,
                    locationName: ev.locationName || source.name,
                    address: ev.address,
                    latitude,
                    longitude,
                    category: ev.category || 'Community',
                    source: 'SCRAPER',
                    sourceUrl: source.url,
                    rawText: JSON.stringify(ev)
                }
            });
            addedCount++;
            process.stdout.write('+');
        } else {
            process.stdout.write('.');
        }
    }
    console.log(`\nSaved ${addedCount} new events.`);

    await prisma.eventSource.update({
        where: { id: sourceId },
        data: { lastScrapedAt: new Date() }
    });
}
