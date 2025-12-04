
import { NextResponse } from 'next/server';
import { ingestLatestNews } from '@/lib/news/ingestion';

export const dynamic = 'force-dynamic'; // Ensure this isn't cached

export async function GET() {
    try {
        console.log('[Cron] Starting news ingestion...');
        const result = await ingestLatestNews();

        if (result.success) {
            return NextResponse.json({ success: true, count: result.count });
        } else {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('[Cron] News ingestion failed:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
