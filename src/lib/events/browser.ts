import puppeteer from 'puppeteer';

export async function scrapeDynamicContent(url: string): Promise<{ pages: string[]; json: any[] }> {
    console.log(`Launching headless browser for: ${url}`);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        const capturedJson: any[] = [];

        // Intercept responses to find JSON data
        page.on('response', async (response) => {
            const contentType = response.headers()['content-type'];
            if (contentType && (contentType.includes('application/json') || contentType.includes('text/json'))) {
                try {
                    // Only capture if it looks like an event list (array or object with events)
                    // We can filter by URL size or content to avoid noise
                    const method = response.request().method();
                    if (method === 'GET' || method === 'POST') {
                        const json = await response.json();
                        capturedJson.push({
                            url: response.url(),
                            data: json
                        });
                    }
                } catch (e) {
                    // Ignore JSON parse errors (sometimes responses are empty or malformed)
                }
            }
        });

        // Set a real user agent
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Navigate and wait for network to be idle
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Safety delay for slow rendering frameworks
        await new Promise(r => setTimeout(r, 5000));

        const pages: string[] = [];
        let currentPageNum = 1;
        const MAX_PAGES = 20;

        while (currentPageNum <= MAX_PAGES) {
            console.log(`Scraping page ${currentPageNum}...`);
            const content = await page.content();
            pages.push(content);

            if (currentPageNum >= MAX_PAGES) break;

            // Try to find and click "Next" button
            const clicked = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('a, button'));
                const nextBtn = buttons.find(el => {
                    const text = (el as HTMLElement).innerText?.toLowerCase() || '';
                    const aria = el.getAttribute('aria-label')?.toLowerCase() || '';
                    // Check visibility
                    const style = window.getComputedStyle(el);
                    const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && (el as HTMLElement).offsetParent !== null;

                    if (!isVisible) return false;

                    return text.includes('next') ||
                        text.includes('load more') ||
                        text.trim() === '>' ||
                        text.trim() === '»' ||
                        aria.includes('next page');
                });

                if (nextBtn) {
                    (nextBtn as HTMLElement).click();
                    return true;
                }
                return false;
            });

            if (clicked) {
                console.log('Clicked next button/link. Waiting for content...');
                // Wait for network activity to settle or a fixed delay
                await new Promise(r => setTimeout(r, 5000));
                currentPageNum++;
            } else {
                console.log('No next button found. Finishing.');
                break;
            }
        }

        return { pages, json: capturedJson };
    } finally {
        await browser.close();
    }
}
