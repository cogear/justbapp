import OpenAI from 'openai';
import * as cheerio from 'cheerio';

export interface ExtractedEvent {
    title: string;
    description: string;
    location: string;
    date: Date;
    category: string;
    tags: string[];
    sourceUrl: string;
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function extractEventsFromUrl(url: string): Promise<ExtractedEvent[]> {
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

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an event extraction agent. Extract local events from the provided text. 
                    Return a JSON object with a key "events" containing an array of events. 
                    Each event must have: title, description, location (full address if possible), date (ISO string), category (one of: "Low Key", "Social", "Class", "Nature"), and tags (array of strings).
                    If a specific year is not mentioned, assume the next occurrence of that date.
                    Only extract future events.`
                },
                {
                    role: "user",
                    content: `Source URL: ${url}\n\nText Content:\n${textContent}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content || '{}');
        const events = result.events || [];

        return events.map((e: any) => ({
            ...e,
            date: new Date(e.date),
            sourceUrl: url
        }));

    } catch (error) {
        console.error(`Error extracting events from ${url}:`, error);
        return [];
    }
}
