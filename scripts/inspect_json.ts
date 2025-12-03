
import { scrapeDynamicContent } from '../src/lib/events/browser';

async function main() {
    const url = 'https://ocls.org/classes-events/';
    console.log(`Inspecting JSON from: ${url}`);

    try {
        // Scrape just 2 pages to get some samples
        const { json } = await scrapeDynamicContent(url);

        console.log(`Captured ${json.length} JSON responses.`);

        for (const item of json) {
            const dataStr = JSON.stringify(item.data);
            if (dataStr.length > 500) {
                console.log(`\n--- JSON from ${item.url} (${dataStr.length} chars) ---`);
                console.log(dataStr.substring(0, 1000)); // Print first 1000 chars
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
