import puppeteer from 'puppeteer';

const URL = 'https://www.brevardfl.gov/PublicLibraries/LibraryCalendar';

async function main() {
    console.log(`Testing headless browser on: ${URL}`);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Intercept responses to find JSON data
        page.on('response', async (response) => {
            try {
                const contentType = response.headers()['content-type'];
                const method = response.request().method();
                const url = response.url();

                console.log(`[${method}] ${url} - ${contentType}`);

                if (contentType && (contentType.includes('application/json') || contentType.includes('text/json'))) {
                    console.log('Attempting to parse JSON for:', url);
                    try {
                        const text = await response.text();
                        console.log(`Response size: ${text.length} chars`);
                        const json = JSON.parse(text);
                        console.log('CAPTURED JSON:', JSON.stringify(json).substring(0, 100) + '...');

                        // Save to file
                        const fs = await import('fs');
                        fs.writeFileSync('scripts/debug_data.json', JSON.stringify(json, null, 2));
                        console.log('Saved JSON to scripts/debug_data.json');
                    } catch (parseError) {
                        console.error('Failed to parse JSON body:', parseError);
                    }
                }
            } catch (e) {
                console.error('Error capturing JSON:', e);
            }
        });

        // Navigate and wait for network to be idle
        await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });

        // Safety delay
        await new Promise(r => setTimeout(r, 10000));

    } catch (error) {
        console.error('Failed:', error);
    } finally {
        await browser.close();
    }
}

main();
