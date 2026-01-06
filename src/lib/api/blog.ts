
// import { notFound } from 'next/navigation'; // Removed unused import

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
