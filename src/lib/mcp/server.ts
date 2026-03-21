import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createPhantomUser, listUsers, seedAllPhantomUsers } from "./tools/users";
import { listSpaces } from "./tools/spaces";
import { createPost, listPosts } from "./tools/posts";
import { createComment } from "./tools/comments";
import { generateWellnessPost, generateAiNewsPost } from "./tools/generate";

export function createMcpServer() {
    const server = new McpServer({
        name: "justbe-community",
        version: "1.0.0",
    });

    server.tool(
        "list_spaces",
        "List all community spaces with post and member counts",
        { type: z.string().optional().describe("Filter by type: FEED or COURSE") },
        async (args) => {
            const result = await listSpaces({ type: args.type });
            return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
        }
    );

    server.tool(
        "create_phantom_user",
        "Create a phantom user for community seeding",
        {
            name: z.string().describe("Display name for the user"),
            email: z.string().describe("Email address (must be unique)"),
            personality: z.string().optional().describe("Personality description"),
        },
        async (args) => {
            const result = await createPhantomUser(args);
            return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
        }
    );

    server.tool(
        "seed_phantom_users",
        "Create all 5 predefined phantom user personas at once",
        {},
        async () => {
            const result = await seedAllPhantomUsers();
            return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
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
            return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
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
            return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
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
            return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
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
            return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
        }
    );

    server.tool(
        "generate_wellness_post",
        "Get book content and a prompt template to craft a wellness post. Returns principle content, quotes, and a suggested author persona.",
        {
            principle_number: z.number().optional().describe("Principle 1-7 (random if omitted)"),
        },
        async (args) => {
            const result = await generateWellnessPost(args);
            return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
        }
    );

    server.tool(
        "generate_ai_news_post",
        "Get recent AI news articles and a prompt template to craft a discussion post.",
        {},
        async () => {
            const result = await generateAiNewsPost();
            return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
        }
    );

    return server;
}
