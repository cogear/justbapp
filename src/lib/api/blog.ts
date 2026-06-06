import * as cheerio from 'cheerio';

export interface BlogPost {
    id: string;
    dateKey: string;
    title: string;
    excerpt: string;
    featuredImage?: string;
    blogUrl?: string;
    publishDate: string;
}

export interface BlogListResponse {
    count: number;
    total: number;
    hasMore: boolean;
    blogs: BlogPost[];
}

export interface DailyEssence {
    /** The anchor quote — `.anchor .big-quote`. */
    anchorQuote: string;
    /** The anchor elaboration — `.anchor .elab`. */
    anchorElaboration?: string;
    /** The Signal section's first (italic) paragraph — `.signal .intro`. */
    signalIntro?: string;
}

/**
 * Pull the day's key blog sections out of the HTML published to S3. Returns null
 * when the post isn't up yet — callers should render nothing in that case. Uses
 * the current blog class names with fallbacks to the legacy ones for older posts.
 */
export async function getDailyEssence(date: Date = new Date()): Promise<DailyEssence | null> {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const url = `https://justbblog.s3.amazonaws.com/blog/${year}/${month}/${day}/index.html`;

    try {
        const res = await fetch(url, { next: { revalidate: 3600 } });
        if (!res.ok) return null;
        const $ = cheerio.load(await res.text());
        const pick = (...sels: string[]) => {
            for (const s of sels) {
                const t = $(s).first().text().trim();
                if (t) return t;
            }
            return '';
        };
        const anchorQuote = pick('.anchor .big-quote', '.big-quote', '.anchor-quote').replace(/^["'"']|["'"']$/g, '');
        const anchorElaboration = pick('.anchor .elab', '.elab', '.anchor-elaboration');
        const signalIntro = pick('.signal .intro', '.signal-gist');
        if (!anchorQuote) return null;
        return {
            anchorQuote,
            anchorElaboration: anchorElaboration || undefined,
            signalIntro: signalIntro || undefined,
        };
    } catch (error) {
        console.error('[BlogAPI] Failed to fetch daily essence:', error);
        return null;
    }
}

const API_BASE = 'https://thewelist.com/api/blogs';

export async function fetchBlogs(params?: { limit?: number; offset?: number; status?: string }): Promise<BlogListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    if (params?.status) searchParams.set('status', params.status);

    const url = `${API_BASE}?${searchParams.toString()}`;
    console.log(`[BlogAPI] Fetching blogs: ${url}`);

    try {
        const res = await fetch(url, { next: { revalidate: 60 } }); // Cache for 1 min
        if (!res.ok) {
            console.error(`[BlogAPI] Failed to fetch blogs: ${res.status}`);
            return { count: 0, total: 0, hasMore: false, blogs: [] };
        }
        return await res.json();
    } catch (error) {
        console.error('[BlogAPI] Error fetching blogs:', error);
        return { count: 0, total: 0, hasMore: false, blogs: [] };
    }
}
