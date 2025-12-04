import Parser from 'rss-parser';
import prisma from '@/lib/prisma';
import OpenAI from 'openai';
import { scrapeContent } from './service';
import { CLUSTERS } from '@/lib/personality/clustering';

// Lazy init OpenAI to prevent build failures if env var is missing
function getOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not set');
    }
    return new OpenAI({ apiKey });
}

export async function ingestLatestNews() {
    console.log('Starting news ingestion...');

    // 1. Fetch RSS Feed
    const parser = new Parser({
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
    });

    let feed;
    try {
        feed = await parser.parseURL('https://news.yahoo.com/rss');
    } catch (e) {
        console.error('Failed to fetch RSS feed:', e);
        return { success: false, error: 'RSS fetch failed' };
    }

    // 2. Filter New Items
    const items = feed.items.slice(0, 30); // Check top 30
    let newArticlesCount = 0;

    for (const item of items) {
        const url = item.link;
        if (!url) continue;

        // Check if exists
        const existing = await prisma.newsArticle.findUnique({
            where: { originalUrl: url }
        });

        if (existing) {
            console.log(`Skipping existing article: ${item.title}`);
            continue;
        }

        // 3. Process New Article
        console.log(`Processing new article: ${item.title}`);

        try {
            // Scrape
            const content = await scrapeContent(url);
            if (!content || content.length < 100) {
                console.warn('Content too short, skipping.');
                continue;
            }

            // Generate Tags & Reframes
            const tags = await generateTags(item.title || '', content);
            const reframes = await generateReframes(item.title || '', content);

            // Save to DB
            await prisma.newsArticle.create({
                data: {
                    originalUrl: url,
                    title: item.title || 'Untitled',
                    description: item.contentSnippet || item.summary || '',
                    content: content,
                    imageUrl: undefined, // RSS doesn't always give good images, maybe scrape later
                    source: 'Yahoo News',
                    publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                    tags: tags,
                    reframedArticles: {
                        create: reframes
                    }
                }
            });

            newArticlesCount++;

            // Limit to 10 new articles per run
            if (newArticlesCount >= 10) break;

        } catch (e) {
            console.error(`Failed to process article ${url}:`, e);
        }
    }

    console.log(`Ingestion complete. Added ${newArticlesCount} new articles.`);
    return { success: true, count: newArticlesCount };
}

async function generateTags(title: string, content: string): Promise<string[]> {
    try {
        const openai = getOpenAI();
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Generate 3-5 relevant tags for this news article. Return only a JSON array of strings, e.g. [\"Tech\", \"AI\"]." },
                { role: "user", content: `Title: ${title}\nContent: ${content.slice(0, 1000)}` }
            ],
            temperature: 0.3,
        });

        const text = completion.choices[0].message.content || '[]';
        return JSON.parse(text.replace(/```json/g, '').replace(/```/g, ''));
    } catch (e) {
        console.error('Tag generation failed:', e);
        return ['News'];
    }
}

async function generateReframes(title: string, content: string) {
    const reframes = [];

    // Parallelize LLM calls
    const promises = CLUSTERS.map(async (cluster) => {
        const prompt = getPromptForCluster(cluster.name);

        try {
            const openai = getOpenAI();
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: prompt },
                    { role: "user", content: `Title: ${title}\nContent: ${content.slice(0, 2000)}` } // Limit context
                ],
                temperature: 0.7,
                response_format: { type: "json_object" }
            });

            const responseText = completion.choices[0].message.content || '';

            // Expecting JSON response or structured text. Let's ask for JSON to be safe.
            // Actually, let's parse a simple format or JSON. JSON is safer.
            const parsed = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, ''));

            return {
                cluster: cluster.name,
                headline: parsed.headline || title,
                summary: parsed.summary || 'No summary.',
                content: parsed.content || content,
                tone: parsed.tone || 'Neutral'
            };
        } catch (e) {
            console.error(`Reframe failed for ${cluster.name}:`, e);
            return null;
        }
    });

    const results = await Promise.all(promises);
    return results.filter(r => r !== null) as any[];
}

function getPromptForCluster(clusterName: string): string {
    const base = `You are an expert editor. Rewrite the following news article for a specific audience persona.
    Return a JSON object with the following fields:
    - "headline": A new headline appealing to this persona.
    - "summary": A 2-sentence teaser summary.
    - "content": The full rewritten article (approx 300-500 words).
    - "tone": The tone used (e.g. "Optimistic", "Analytical").
    
    Persona: ${clusterName}
    `;

    switch (clusterName) {
        case 'Average':
            return base + `Target: Everyday adults. Tone: Balanced, relatable, slightly simplified. Focus on practical impact.`;
        case 'Reserved':
            return base + `Target: Quiet, cautious, dependable. Tone: Calm, objective, low-drama. Remove sensationalism. Focus on stability.`;
        case 'Ego-Resilient':
            return base + `Target: Bold, impulsive, attention-seeking. Tone: Exciting, punchy, direct. Focus on "What's in it for me?" and immediate action.`;
        case 'Role Model':
            return base + `Target: High-functioning leaders. Tone: Professional, inspiring, solution-oriented. Focus on leadership, community impact, and positive progress.`;
        case 'Methodical Introvert':
            return base + `Target: Structured, disciplined. Tone: Precise, data-driven, logical. Use bullet points where appropriate. Focus on facts and efficiency.`;
        case 'Explorer':
            return base + `Target: Creative, curious, novelty-seeking. Tone: Speculative, imaginative, connecting dots. Focus on future possibilities, innovation, and "big ideas".`;
        default:
            return base;
    }
}
