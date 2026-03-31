import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { z } from "zod";
import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env from the project root
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../.env") });
dotenv.config({ path: resolve(__dirname, "../../.env.local") });

import { createPhantomUser, listUsers, seedAllPhantomUsers } from "./tools/users.js";
import { listSpaces } from "./tools/spaces.js";
import { createPost, listPosts } from "./tools/posts.js";
import { createComment } from "./tools/comments.js";
import { generateWellnessPost, generateAiNewsPost } from "./tools/generate.js";

function registerTools(server: McpServer) {
    server.tool(
        "list_spaces",
        "List all community spaces with post and member counts",
        { type: z.string().optional().describe("Filter by type: FEED or COURSE") },
        async (args) => {
            const result = await listSpaces({ type: args.type });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    server.tool(
        "create_phantom_user",
        "Create a phantom user for community seeding",
        {
            name: z.string().describe("Display name for the user"),
            email: z.string().describe("Email address (must be unique)"),
            personality: z.string().optional().describe("Personality description for content generation"),
        },
        async (args) => {
            const result = await createPhantomUser(args);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    server.tool(
        "seed_phantom_users",
        "Create all 5 predefined phantom user personas at once",
        {},
        async () => {
            const result = await seedAllPhantomUsers();
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    server.tool(
        "list_users",
        "List users in the database",
        {
            phantoms_only: z.boolean().optional().describe("Only show phantom users"),
            limit: z.number().optional().describe("Max users to return (default 50)"),
        },
        async (args) => {
            const result = await listUsers(args);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    server.tool(
        "create_post",
        "Create a post in a community space",
        {
            content: z.string().describe("The post content"),
            space_slug: z.string().describe("Space slug (e.g. 'general', 'introductions')"),
            author_email: z.string().describe("Email of the author user"),
        },
        async (args) => {
            const result = await createPost(args);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    server.tool(
        "list_posts",
        "List recent posts in a space or across all spaces",
        {
            space_slug: z.string().optional().describe("Filter by space slug"),
            limit: z.number().optional().describe("Max posts to return (default 20)"),
        },
        async (args) => {
            const result = await listPosts(args);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    server.tool(
        "create_comment",
        "Add a comment to a post",
        {
            content: z.string().describe("The comment text"),
            post_id: z.string().describe("ID of the post to comment on"),
            author_email: z.string().describe("Email of the comment author"),
        },
        async (args) => {
            const result = await createComment(args);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    server.tool(
        "generate_wellness_post",
        "Get book content and a prompt template to craft a wellness post. Returns principle content, quotes, and a suggested author persona. Use the returned prompt to write the post, then call create_post to publish it.",
        {
            principle_number: z.number().optional().describe("Principle 1-7 (random if omitted)"),
        },
        async (args) => {
            const result = await generateWellnessPost(args);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    server.tool(
        "generate_ai_news_post",
        "Get recent AI news articles and a prompt template to craft a discussion post. Returns article summaries and a suggested author persona. Use the returned prompt to write the post, then call create_post to publish it.",
        {},
        async () => {
            const result = await generateAiNewsPost();
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );
}

// --- HTTP mode with Bearer auth ---
async function startHttpServer() {
    const port = parseInt(process.env.MCP_PORT || "3100", 10);
    const bearerToken = process.env.MCP_SECRET_KEY;

    if (!bearerToken) {
        console.error("MCP_SECRET_KEY environment variable is required for HTTP mode");
        process.exit(1);
    }

    const app = express();
    app.use(express.json());

    // Auth middleware: accepts Bearer header or ?secret_key= query param
    app.use("/mcp", (req, res, next) => {
        const authHeader = req.headers.authorization;
        const queryKey = req.query.secret_key as string | undefined;

        const isAuthorized =
            (authHeader && authHeader === `Bearer ${bearerToken}`) ||
            (queryKey && queryKey === bearerToken);

        if (!isAuthorized) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        next();
    });

    // Track transports by session for stateful connections
    const transports = new Map<string, StreamableHTTPServerTransport>();

    app.all("/mcp", async (req, res) => {
        const sessionId = req.headers["mcp-session-id"] as string | undefined;

        if (req.method === "GET" || req.method === "DELETE") {
            const transport = sessionId ? transports.get(sessionId) : undefined;
            if (!transport) {
                res.status(400).json({ error: "No active session" });
                return;
            }
            await transport.handleRequest(req, res);
            if (req.method === "DELETE") {
                transports.delete(sessionId!);
            }
            return;
        }

        // POST: either resume existing session or start new one
        if (sessionId && transports.has(sessionId)) {
            await transports.get(sessionId)!.handleRequest(req, res);
            return;
        }

        // New session
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => crypto.randomUUID(),
            onsessioninitialized: (id) => {
                transports.set(id, transport);
            },
        });

        transport.onclose = () => {
            const id = [...transports.entries()].find(([, t]) => t === transport)?.[0];
            if (id) transports.delete(id);
        };

        const server = new McpServer({
            name: "justbe-community",
            version: "1.0.0",
        });
        registerTools(server);
        await server.connect(transport);
        await transport.handleRequest(req, res);
    });

    app.listen(port, () => {
        console.log(`MCP HTTP server listening on port ${port}`);
        console.log(`Endpoint: http://localhost:${port}/mcp`);
    });
}

// --- Stdio mode (local, no auth needed) ---
async function startStdioServer() {
    const server = new McpServer({
        name: "justbe-community",
        version: "1.0.0",
    });
    registerTools(server);
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

// Use --http flag or MCP_TRANSPORT=http to start in HTTP mode
const useHttp = process.argv.includes("--http") || process.env.MCP_TRANSPORT === "http";

if (useHttp) {
    startHttpServer().catch(console.error);
} else {
    startStdioServer().catch(console.error);
}
