import OpenAI from 'openai';
import { VisualProfile } from '@prisma/client';
import * as cheerio from 'cheerio';

// Lazy init OpenAI
function getOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not set');
    }
    return new OpenAI({ apiKey });
}

export interface NewsStory {
    id: string;
    title: string;
    content: string;
    fullContent?: string;
    source: string;
    url: string;
    imageUrl?: string;
    publishedAt: string;
    isMock?: boolean;
    rawData?: any;
}

export interface ReframedStory extends NewsStory {
    originalTitle: string;
    originalContent: string;
    reframedBy: string; // e.g., "Neuroticism Filter"
    rawData?: any;
}

// Mock Data Removed
const MOCK_NEWS: NewsStory[] = [];

import Parser from 'rss-parser';

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function scrapeContent(url: string): Promise<string> {
    try {
        if (!url || !url.startsWith('http')) {
            console.warn(`Skipping scrape for invalid URL: ${url}`);
            return 'Invalid URL for scraping.';
        }

        console.log(`Scraping content from: ${url}`);

        // Use curl to bypass Node's header size limits (Yahoo Finance sends >16KB headers)
        const { stdout } = await execAsync(`curl -s -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" "${url}"`, {
            maxBuffer: 1024 * 1024 * 10 // 10MB buffer
        });

        const html = stdout;
        const $ = cheerio.load(html);

        // Remove scripts, styles, and other non-content elements
        $('script, style, noscript, iframe, svg').remove();

        // Yahoo News specific selectors (and generic fallbacks)
        // Yahoo often uses 'div.caas-body' for content
        const content = $('div.caas-body').text() || $('article').text() || $('main').text() || 'Could not extract content.';

        // Clean up whitespace
        return content.replace(/\s+/g, ' ').trim();
    } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        return 'Error scraping content.';
    }
}

import prisma from '@/lib/prisma';
import { ingestLatestNews } from './ingestion';
import { CLUSTERS } from '@/lib/personality/clustering';

export async function getTopStories(userCluster?: string): Promise<any[]> {
    console.log('Fetching news...');

    // 1. Check for recent news in DB
    const recentCount = await prisma.newsArticle.count({
        where: {
            createdAt: {
                gt: new Date(Date.now() - 1000 * 60 * 60) // Last 1 hour
            }
        }
    });

    // 2. Ingest if stale
    if (recentCount === 0) {
        console.log('News is stale or empty. Triggering ingestion...');
        await ingestLatestNews();
    }

    // 3. Fetch from DB
    const articles = await prisma.newsArticle.findMany({
        orderBy: { publishedAt: 'desc' },
        take: 20,
        include: {
            reframedArticles: true
        }
    });

    // 4. Map to UI format
    return articles.map(article => {
        // Find the reframe for the user's cluster, or default to 'Average' or the first one
        const targetCluster = userCluster || 'Average';
        const reframe = article.reframedArticles.find(r => r.cluster === targetCluster)
            || article.reframedArticles[0];

        return {
            id: article.id,
            title: reframe?.headline || article.title,
            summary: reframe?.summary || article.description,
            content: reframe?.content || article.content, // Show reframed content by default
            originalContent: article.content,
            source: article.source,
            url: article.originalUrl,
            imageUrl: article.imageUrl,
            publishedAt: article.publishedAt.toISOString(),
            tags: article.tags,
            cluster: reframe?.cluster,
            tone: reframe?.tone
        };
    });
}

export async function reframeStory(story: NewsStory, profile: VisualProfile): Promise<ReframedStory> {
    if (!process.env.OPENAI_API_KEY) {
        console.warn('OPENAI_API_KEY not found, returning original story');
        return {
            ...story,
            originalTitle: story.title,
            originalContent: story.content,
            reframedBy: 'None'
        };
    }

    // 1. Determine the dominant trait filter
    // We prioritize the most extreme trait or the one that needs the most "translation"
    // For MVP, let's check Neuroticism first as it's the biggest stressor

    let systemInstruction = '';
    let filterName = 'Standard';

    // Normalize scores to 0-100 if they aren't already (assuming they are stored as 0-100 in DB)
    const nScore = profile.neuroticism;
    const oScore = profile.openness;
    const aScore = profile.agreeableness;
    const cScore = profile.conscientiousness;
    const eScore = profile.extraversion;

    // Logic from User Request
    if (nScore > 60) {
        filterName = 'Calm & Reassuring';
        systemInstruction = `
        You are a "Constructive Journalist" editor. The reader has High Neuroticism (prone to anxiety).
        Rewrite the following news story to minimize stress.
        Tone: Calm, reassuring, and objective. Avoid "alert" words.
        Structure: Use the "Sandwich Method": Context -> The Event -> The Solution/Action being taken.
        Key Feature: Always include a "Silver Lining" or "What can be done?" section. Remove uncertainty.
        `;
    } else if (oScore > 60) {
        filterName = 'Deep Analysis';
        systemInstruction = `
        You are an "Intellectual Analyst" editor. The reader has High Openness (curious, abstract).
        Rewrite the story to provide deep context.
        Tone: Intellectual and exploratory.
        Structure: Connect the news to broader trends, history, or philosophy. Use metaphors.
        Focus: The "Why" and "Future Implications".
        `;
    } else if (aScore > 60) {
        filterName = 'Human-Centric';
        systemInstruction = `
        You are a "Community-Focused" editor. The reader has High Agreeableness (empathetic).
        Rewrite the story to focus on human impact.
        Tone: Warm and communal.
        Structure: Focus on the human impact (stories of individuals), community response, and cooperation.
        Filtering: Minimize conflict/aggression. Highlight cooperation.
        `;
    } else if (cScore > 60) {
        filterName = 'Structured Briefing';
        systemInstruction = `
        You are a "Precision" editor. The reader has High Conscientiousness (organized).
        Rewrite the story as a structured briefing.
        Tone: Professional and precise.
        Structure: Use bullet points, timelines, and clear headers.
        Focus: Accuracy and data.
        `;
    } else if (oScore < 40) {
        filterName = 'Pragmatic Summary';
        systemInstruction = `
        You are a "Pragmatic" editor. The reader has Low Openness (practical, concrete).
        Rewrite the story to be grounded and practical.
        Tone: Grounded.
        Structure: "Here is what happened and here is how it affects your daily life."
        Focus: Concrete facts. Avoid speculation.
        `;
    } else {
        // Default / Balanced
        filterName = 'Balanced';
        systemInstruction = `
        Rewrite the news story to be clear, concise, and balanced.
        `;
    }

    try {
        const openai = getOpenAI();
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemInstruction },
                {
                    role: "user",
                    content: `Title: ${story.title}\nContent: ${story.content}`
                }
            ],
            temperature: 0.7,
        });

        const reframedContent = completion.choices[0].message.content || story.content;

        return {
            ...story,
            originalTitle: story.title,
            originalContent: story.content,
            content: reframedContent,
            reframedBy: filterName
        };

    } catch (error) {
        console.error('Error reframing story:', error);
        return {
            ...story,
            originalTitle: story.title,
            originalContent: story.content,
            reframedBy: 'Error (Fallback)'
        };
    }
}
