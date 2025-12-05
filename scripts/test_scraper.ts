import { scrapeContent } from '../src/lib/news/service';
import Parser from 'rss-parser';

async function main() {
    console.log('Fetching RSS feed to find a valid URL...');
    const parser = new Parser();
    let url = '';

    try {
        const feed = await parser.parseURL('https://news.yahoo.com/rss');
        if (feed.items.length > 0 && feed.items[0].link) {
            url = feed.items[0].link;
            console.log(`Found article: ${feed.items[0].title}`);
        } else {
            console.error('No items found in RSS feed.');
            return;
        }
    } catch (e) {
        console.error('Failed to parse RSS:', e);
        return;
    }

    console.log(`Testing scraper on: ${url}`);
    const content = await scrapeContent(url);

    console.log('--- SCRAPED CONTENT START ---');
    console.log(content);
    console.log('--- SCRAPED CONTENT END ---');
}

main();
