import OpenAI from 'openai';
import * as cheerio from 'cheerio';

export interface ExtractedEvent {
    title: string;
    description: string;
    locationName: string;
    address: string;
    startTime: Date;
    endTime?: Date;
    category: string;
    tags: string[];
    sourceUrl: string;
}

// Lazy init OpenAI
function getOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not set');
    }
    return new OpenAI({ apiKey });
}

export async function extractEventsFromUrl(url: string, defaultLocation?: string): Promise<ExtractedEvent[]> {
    console.log(`Extracting events from ${url}...`);

    try {
        // 1. Fetch HTML
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch ${url}: ${response.statusText}`);
            return [];
        }
        const html = await response.text();

        // 2. Clean HTML with Cheerio
        const $ = cheerio.load(html);
        $('script').remove();
        $('style').remove();
        $('nav').remove();
        $('footer').remove();
        const textContent = $('body').text().replace(/\s+/g, ' ').substring(0, 15000); // Limit context window

        // 3. Send to OpenAI
        if (!process.env.OPENAI_API_KEY) {
            console.warn('OPENAI_API_KEY not found, skipping extraction');
            return [];
        }

        const openai = getOpenAI();
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an event extraction agent. Extract local events from the provided text. 
                    Return a JSON object with a key "events" containing an array of events. 
                    Each event must have: 
                    - title
                    - description
                    - locationName (e.g. "Central Park")
                    - address (full address if possible)
                    - startTime (ISO string)
                    - endTime (ISO string, optional)
                    - category (one of: "Low Key", "Social", "Class", "Nature")
                    - tags (array of strings).
                    
                    CRITICAL: All events MUST have an address. 
                    - If the address is explicitly listed, use it.
                    - If the address is NOT listed, try to infer it from the page context (e.g. if the page is for "Brevard Library", use that address).
                    - If you absolutely cannot find an address, leave it empty string.
                    
                    If a specific year is not mentioned, assume the next occurrence of that date.
                    Only extract future events.`
                },
                {
                    role: "user",
                    content: `Source URL: ${url}\nDefault Location Context: ${defaultLocation || 'None'}\n\nText Content:\n${textContent}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content || '{}');
        const events = result.events || [];

        return events.map((e: any) => ({
            ...e,
            startTime: new Date(e.startTime || e.date),
            endTime: e.endTime ? new Date(e.endTime) : undefined,
            locationName: e.locationName || e.location || defaultLocation || '',
            address: e.address || defaultLocation || '',
            sourceUrl: url
        }));

    } catch (error) {
        console.error(`Error extracting events from ${url}:`, error);
        return [];
    }
}
