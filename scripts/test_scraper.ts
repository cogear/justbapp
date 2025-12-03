import prisma from '../src/lib/prisma';
import { scrapeHub } from '../src/lib/events/ingestion';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    // 1. Create a test source (using a real library URL if possible, or a mock one)
    // Using Boston Public Library events page as a test case, or a generic one.
    // Let's use a specific library branch page which is usually simpler.
    const testUrl = "https://bpl.bibliocommons.com/v2/events";

    console.log("Creating test source...");
    const source = await prisma.eventSource.upsert({
        where: { url: testUrl },
        update: {},
        create: {
            url: testUrl,
            name: "Boston Public Library",
            parserType: "HTML_LLM"
        }
    });

    console.log(`Source ID: ${source.id}`);

    // 2. Run scraper
    await scrapeHub(source.id);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
