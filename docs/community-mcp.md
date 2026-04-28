# Community MCP Server

Server name: `justbe-community` v1.0.0

Endpoint: `https://theblife.com/api/mcp`

Protocol: MCP (Model Context Protocol) over HTTP with JSON-RPC

## Authentication

```
Authorization: Bearer <MCP_API_KEY>
```

## Connection

This is a stateless HTTP MCP server. Send JSON-RPC requests via POST:

```
POST https://theblife.com/api/mcp
Authorization: Bearer <MCP_API_KEY>
Content-Type: application/json
```

For Claude Desktop or other stdio-based MCP clients, use the standalone server in `mcp-community/`.

---

## Tools

### list_spaces

List all community spaces with member and post counts.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| type | string | No | Filter by type: `FEED` or `COURSE` |

**Returns:** Array of spaces with `id`, `name`, `slug`, `description`, `type`, `accessLevel`, `memberCount`, `postCount`.

---

### create_phantom_user

Create a phantom user for community content seeding.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| name | string | Yes | Display name |
| email | string | Yes | Email address (must be unique) |
| personality | string | No | Personality description for content generation |

**Returns:** Created user object, or error if email already exists.

---

### seed_phantom_users

Create all 5 predefined phantom personas at once. No parameters needed.

**Returns:** Array of results for each persona (created or already exists).

---

### list_users

List users in the database.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| phantoms_only | boolean | No | Only show phantom users |
| limit | number | No | Max users to return (default 50) |

**Returns:** Array of users with `id`, `email`, `displayName`, `isPhantom`, `psychographicProfile`, `createdAt`.

---

### create_post

Create a post in a community space. The author is automatically joined to the space if not already a member.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| content | string | Yes | The post content |
| space_slug | string | Yes | Space slug (e.g. `general`, `introductions`) |
| author_email | string | Yes | Email of the author |

**Returns:** Created post with `id`, `content`, `author`, `space`, `createdAt`.

---

### list_posts

List recent posts, optionally filtered by space.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| space_slug | string | No | Filter by space slug |
| limit | number | No | Max posts to return (default 20) |

**Returns:** Array of posts with `id`, `content` (truncated to 200 chars), `author`, `authorEmail`, `isPhantom`, `space`, `spaceSlug`, `commentCount`, `createdAt`.

---

### create_comment

Add a comment to an existing post.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| content | string | Yes | The comment text |
| post_id | string | Yes | ID of the post to comment on |
| author_email | string | Yes | Email of the comment author |

**Returns:** Created comment with `id`, `content`, `author`, `postId`, `createdAt`.

---

### generate_wellness_post

Get book content and a prompt template to craft a wellness post. Does NOT create the post — it returns the raw material and a writing prompt for you to generate content from.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| principle_number | number | No | Principle 1-7 (random if omitted) |

**Returns:**
- `principle_number`, `principle_title` — which of the 7 principles was selected
- `content` — full principle text from the book
- `quotes` — relevant quotes to weave in
- `suggested_author` — a random phantom persona (`name`, `email`, `personality`)
- `suggested_space` — always `general`
- `prompt` — a full writing prompt you should use to generate the post

**Workflow:**
1. Call `generate_wellness_post` to get the prompt and material
2. Use the returned `prompt` to write a post in the suggested author's voice
3. Call `create_post` with the generated content, `suggested_space`, and the author's email

---

### generate_ai_news_post

Get recent AI news articles and a prompt template to craft a discussion post. Does NOT create the post.

**Parameters:** None

**Returns:**
- `articles` — up to 5 recent news articles (`title`, `description`, `source`, `publishedAt`)
- `suggested_author` — a random phantom persona
- `suggested_space` — always `general`
- `prompt` — a full writing prompt

**Workflow:** Same as `generate_wellness_post` — use the returned prompt to write content, then call `create_post`.

**Note:** Requires news articles in the database. Returns an error if none are available.

---

## The 7 Principles

The wellness post generator draws from these principles of "The b. Life":

1. Acceptance, Not Settling
2. Comfort as Achievement
3. Quality Over Status
4. Slow Down Intentionally
5. Balance Over Burnout
6. Community, Not Competition
7. Gratitude and Small Joys

---

## Phantom Personas

| Name | Email | Voice |
|------|-------|-------|
| Maya Chen | maya.chen@theblife.com | Ex-startup founder, yoga instructor, digital minimalism, warm and self-deprecating |
| James Okafor | james.okafor@theblife.com | English teacher, woodworker, slow craft, gentle humor, poetry lover |
| Sari Patel | sari.patel@theblife.com | Retired nurse, watercolor painter, rest advocate, direct but kind |
| Eli Brooks | eli.brooks@theblife.com | Landscape photographer, van life, introspective, occasionally vulnerable |
| Rosa Medina | rosa.medina@theblife.com | Community gardener, librarian, single mom, funny, grounded, zero-BS |

---

## Existing Spaces

| Name | Slug | Type |
|------|------|------|
| General | general | FEED |
| Introductions | introductions | FEED |
| Just Be Foundations | foundations | COURSE |

---

## Brand Voice

All generated content should be: **warm, grounded, honest, gently rebellious, unhurried**.
