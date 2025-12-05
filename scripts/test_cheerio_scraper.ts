
import { scrapeContent } from '../src/lib/news/service';
import Parser from 'rss-parser';

async function main() {
    const parser = new Parser();
    console.log('Fetching RSS feed to find a valid URL...');

    try {
        const feed = await parser.parseURL('https://news.yahoo.com/rss');
        // Get a random item from the top 5 to avoid same-article fatigue
        const index = Math.floor(Math.random() * Math.min(5, feed.items.length));
        const item = feed.items[index];

        if (item && item.link) {
            console.log(`Testing on: ${item.title}`);
            console.log(`URL: ${item.link}`);

            const md = await scrapeContent(item.link);

            console.log('\n--- MARKDOWN START ---');
            console.log(md);
            console.log('--- MARKDOWN END ---\n');
        } else {
            console.log('No items found in RSS feed.');
        }
    } catch (e) {
        console.error('Error running test:', e);
    }
}

main();
