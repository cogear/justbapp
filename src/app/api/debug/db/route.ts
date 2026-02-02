
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('API: Testing Database Connection...');
        const start = Date.now();

        // Attempt simple query
        const count = await prisma.user.count();
        const duration = Date.now() - start;

        // Check environment variable presence (do NOT log values)
        const dbUrlParams = process.env.DATABASE_URL ? "Set" : "Missing";
        const directUrlParams = process.env.DIRECT_URL ? "Set" : "Missing";

        return NextResponse.json({
            status: 'success',
            message: 'Database connection successful',
            userCount: count,
            durationMs: duration,
            env: {
                DATABASE_URL: dbUrlParams,
                DIRECT_URL: directUrlParams,
                NODE_ENV: process.env.NODE_ENV
            }
        });
    } catch (error: any) {
        console.error('API: Database Connection Failed:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack
        }, { status: 500 });
    }
}
