import { createMcpServer } from "@/lib/mcp/server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { NextRequest, NextResponse } from "next/server";

function authenticate(request: NextRequest): boolean {
    const apiKey = process.env.MCP_API_KEY;
    if (!apiKey) return false;

    const authHeader = request.headers.get("authorization");
    if (!authHeader) return false;

    const token = authHeader.replace("Bearer ", "");
    return token === apiKey;
}

// Stateless transport — new server instance per request (suitable for serverless)
async function handleMcpRequest(request: Request): Promise<Response> {
    const server = createMcpServer();
    const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
    });

    await server.connect(transport);

    const response = await transport.handleRequest(request);

    return response;
}

export async function POST(request: NextRequest) {
    if (!authenticate(request)) {
        return NextResponse.json(
            { jsonrpc: "2.0", error: { code: -32000, message: "Unauthorized" }, id: null },
            { status: 401 }
        );
    }

    return handleMcpRequest(request);
}

export async function GET(request: NextRequest) {
    if (!authenticate(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handleMcpRequest(request);
}

export async function DELETE(request: NextRequest) {
    if (!authenticate(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handleMcpRequest(request);
}
