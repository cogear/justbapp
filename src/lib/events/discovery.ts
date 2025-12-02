export interface EventSource {
    url: string;
    type: 'calendar' | 'social' | 'news';
    confidence: number;
}

interface SerperResult {
    organic: Array<{
        title: string;
        link: string;
        snippet: string;
    }>;
}

export async function discoverEventSources(zipCode: string): Promise<EventSource[]> {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
        console.warn('SERPER_API_KEY not found, returning empty list');
        return [];
    }

    console.log(`Discovering event sources for ${zipCode} using Serper...`);

    const queries = [
        `events in ${zipCode} this week`,
        `public library calendar ${zipCode}`,
        `farmers market ${zipCode}`,
        `community center events ${zipCode}`
    ];

    const sources: EventSource[] = [];
    const seenUrls = new Set<string>();

    // We'll just run the first query for now to save credits/time in this demo, 
    // but in production you'd run all or a smart subset.
    const query = queries[0];

    try {
        const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                q: query,
                num: 10
            })
        });

        if (!response.ok) {
            throw new Error(`Serper API error: ${response.statusText}`);
        }

        const data = (await response.json()) as SerperResult;

        if (data.organic) {
            for (const result of data.organic) {
                // Basic filtering to avoid big aggregators if desired
                // For now, we accept most, but maybe skip some common noise
                if (result.link.includes('tripadvisor') || result.link.includes('yelp')) {
                    continue;
                }

                if (!seenUrls.has(result.link)) {
                    seenUrls.add(result.link);
                    sources.push({
                        url: result.link,
                        type: 'calendar', // Defaulting for now
                        confidence: 0.8
                    });
                }
            }
        }

    } catch (error) {
        console.error('Error fetching from Serper:', error);
    }

    return sources;
}
