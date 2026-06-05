// Standalone Circles MCP server. Exposes the engine as an organizer toolset so a
// connected agent can run a group the way a human would. Mirrors the community
// server in src/lib/mcp/server.ts. All user ids are OPAQUE host ids.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as tools from './tools';

const json = (result: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
});

const cadenceSchema = z
  .object({
    rhythm: z.enum(['weekly', 'monthly', 'adhoc']),
    days: z.array(z.string()).optional(),
    nth: z.number().optional(),
    weekday: z.string().optional(),
    time: z.string().optional(),
  })
  .describe('Cadence: weekly {days,time}, monthly {nth,weekday,time}, or adhoc');

const optionSchema = z.object({
  id: z.string(),
  label: z.string(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export function createCirclesMcpServer() {
  const server = new McpServer({ name: 'circles', version: '1.0.0' });

  // ── act ──
  server.tool(
    'circles_create_group',
    'Create a recurring group. The owner_user_id (opaque host id) becomes its owner.',
    {
      name: z.string(),
      kind: z.enum(['dinner', 'sport', 'boardgames', 'coffee', 'generic']),
      timezone: z.string().describe('IANA timezone, e.g. America/New_York'),
      owner_user_id: z.string().describe('opaque host User.id'),
      cadence: cadenceSchema.optional(),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (args) => json(await tools.createGroup(args as any)),
  );

  server.tool(
    'circles_invite_member',
    'Invite a user to a group. Requires organizer rights (acting_user_id).',
    {
      group_id: z.string(),
      acting_user_id: z.string().describe('opaque id of an owner/co-organizer'),
      user_id: z.string().describe('opaque id of the invitee'),
    },
    async (args) => json(await tools.inviteMember(args)),
  );

  server.tool(
    'circles_create_meetup',
    'Create a one-off meetup. Requires organizer rights.',
    {
      group_id: z.string(),
      acting_user_id: z.string(),
      starts_at: z.string().describe('ISO 8601 datetime'),
    },
    async (args) => json(await tools.createMeetup(args)),
  );

  server.tool(
    'circles_set_rsvp',
    "Set a user's RSVP for a meetup.",
    {
      meetup_id: z.string(),
      user_id: z.string(),
      state: z.enum(['yes', 'no', 'maybe', 'none']),
    },
    async (args) => json(await tools.setRsvp(args)),
  );

  server.tool(
    'circles_open_decision',
    'Open the decide-step (venue/host vote) for a meetup. Requires organizer rights.',
    {
      meetup_id: z.string(),
      acting_user_id: z.string(),
      options: z.array(optionSchema).describe('proposed options, e.g. venues'),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (args) => json(await tools.openDecision(args as any)),
  );

  server.tool(
    'circles_cast_vote',
    'Cast or change a vote in an open decision.',
    { decision_id: z.string(), user_id: z.string(), option_id: z.string() },
    async (args) => json(await tools.castVote(args)),
  );

  server.tool(
    'circles_promote_co_organizer',
    'Promote a member to co-organizer. Requires organizer rights.',
    { group_id: z.string(), acting_user_id: z.string(), target_user_id: z.string() },
    async (args) => json(await tools.promoteCoOrganizer(args)),
  );

  // ── read ──
  server.tool(
    'circles_get_meetup',
    'Read a meetup: headcount, RSVPs, decision state, and photos.',
    { meetup_id: z.string() },
    async (args) => json(await tools.getMeetup(args)),
  );

  server.tool(
    'circles_get_decision',
    'Read a decision and its vote tally.',
    { decision_id: z.string() },
    async (args) => json(await tools.getDecision(args)),
  );

  server.tool(
    'circles_get_timeline',
    "A group's recent past meetups and its next upcoming one.",
    { group_id: z.string() },
    async (args) => json(await tools.getTimeline(args)),
  );

  server.tool(
    'circles_list_non_responders',
    "Active members of a meetup's group who haven't RSVP'd (for nudging no-replies).",
    { meetup_id: z.string() },
    async (args) => json(await tools.listNonResponders(args)),
  );

  server.tool(
    'circles_group_overview',
    'At-a-glance organizer summary: next meetup, headcount, open decision tally, and who has not responded.',
    { group_id: z.string() },
    async (args) => json(await tools.groupOverview(args)),
  );

  return server;
}
