import { NextRequest, NextResponse } from 'next/server';

export function authenticate(request: NextRequest): boolean {
    const apiKey = process.env.MCP_API_KEY;
    if (!apiKey) return false;

    // Check Bearer header
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        if (token === apiKey) return true;
    }

    // Check ?secret_key= query param (for Claude cowork connections)
    const secretKey = request.nextUrl.searchParams.get('secret_key');
    if (secretKey === apiKey) return true;

    return false;
}

export function unauthorized() {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
