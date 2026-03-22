import { NextRequest, NextResponse } from 'next/server';

export function authenticate(request: NextRequest): boolean {
    const apiKey = process.env.MCP_API_KEY;
    if (!apiKey) return false;

    const authHeader = request.headers.get('authorization');
    if (!authHeader) return false;

    const token = authHeader.replace('Bearer ', '');
    return token === apiKey;
}

export function unauthorized() {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
