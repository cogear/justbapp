import { createCirclesMcpServer } from '@/lib/circles/mcp/server';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/api-auth';

// Standalone Circles MCP endpoint. Stateless — a fresh server per request.
async function handleMcpRequest(request: Request): Promise<Response> {
    const server = createCirclesMcpServer();
    const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
    });

    await server.connect(transport);
    return transport.handleRequest(request);
}

export async function POST(request: NextRequest) {
    if (!authenticate(request)) {
        return NextResponse.json(
            { jsonrpc: '2.0', error: { code: -32000, message: 'Unauthorized' }, id: null },
            { status: 401 },
        );
    }
    return handleMcpRequest(request);
}

export async function GET(request: NextRequest) {
    if (!authenticate(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handleMcpRequest(request);
}

export async function DELETE(request: NextRequest) {
    if (!authenticate(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handleMcpRequest(request);
}
