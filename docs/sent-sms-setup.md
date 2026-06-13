# SMS Setup — Sent (sent.dm)

The community comms hub sends text messages through **Sent (sent.dm)**, a
unified SMS/iMessage/WhatsApp/RCS API. We use the **SMS** channel today; the
wrapper is built so richer channels can switch on later.

**Key fact:** Sent is **template-only** — there is no free-form text field.
Every message is a pre-approved template with variables. So SMS in this app is
*notification-style*: "you have a new message / invitation — open the app",
with the actual content staying in-app and in email. OTP codes are a template too.

> Sent still requires **10DLC** registration for the SMS channel (same carrier
> rule as any A2P SMS). This is handled inside the Sent dashboard.

---

## What's already done

- ✅ Sent account + `SENT_API_KEY` (in `.env.local`)
- ✅ Approved OTP template `sent_Verify_Code_2` (variable `var_1` = the code)

## What you need to finish

### 1. 10DLC + a sending number (Sent dashboard)
Register your brand + campaign and attach a 10DLC number under your account.
Carrier review is the usual 1–3 weeks. Until a number is active, sends will fail.

### 2. Create the notification templates
The app sends these template **names** (override via env if you name them
differently). Variables are positional — `var_1`, `var_2`, … in the order shown.
Submit each for approval in the dashboard.

| Template name | Used for | Suggested content | Variables |
|---|---|---|---|
| `sent_Verify_Code_2` | Phone verification | *(already approved)* | `var_1` = code |
| `theblife_new_message` | New direct message | `New message from {{var_1}} on The B Life. Read & reply: {{var_2}}` | `var_1` = sender, `var_2` = link |
| `theblife_invite` | Space invitation | `{{var_1}} invited you to {{var_2}} on The B Life. Accept: {{var_3}} — reply STOP to opt out.` | `var_1` = inviter, `var_2` = space, `var_3` = link |
| `theblife_notification` | Event / announcement | `The B Life: {{var_1}} {{var_2}}` | `var_1` = message, `var_2` = link |
| `theblife_open_app` | Inbound auto-reply | `Open The B Life to read and reply: {{var_1}}` | `var_1` = messages link |

*(If you name a template differently, set the matching env var — e.g.
`SENT_TEMPLATE_NEW_MESSAGE` — instead of renaming in the dashboard.)*

Until `theblife_*` templates are approved, **only OTP works**; the other SMS
sends fail gracefully and email still carries the full content.

### 3. Configure the inbound webhook
In the Sent dashboard → Webhooks:
- **URL:** `https://theblife.com/api/webhooks/sms`
- **Events:** subscribe to `message.received` (inbound replies) and message
  status events (delivered / failed).
- Copy the **signing secret** (starts with `whsec_`).

### 4. Set environment variables (Vercel)
| Var | Value |
|---|---|
| `SENT_API_KEY` | *(already set)* |
| `SENT_WEBHOOK_SECRET` | the `whsec_…` signing secret from step 3 |
| `SENT_API_URL` | *(optional; defaults to `https://api.sent.dm`)* |
| `SENT_TEMPLATE_*` | *(optional; only if your template names differ)* |

Then redeploy. `SENT_API_KEY` alone makes the phone-verification UI live;
the notification templates light up as they're approved.

---

## How it behaves

- **OTP** → `sent_Verify_Code_2`, code as `var_1`.
- **DM / invite / announcement** → notification template + a link; content stays in-app/email.
- **Inbound reply** → `message.received` webhook (HMAC-verified) → routed to the
  member's single most-recent SMS conversation (72h window). Zero or multiple
  active chats → we reply with `theblife_open_app`. `STOP` suppresses the contact
  (Sent also auto-handles opt-out).

## How sends/receives are wired (for engineers)

- Outbound: `src/lib/messaging/sms.ts` → `POST https://api.sent.dm/v3/messages`
  with `{ to:[E.164], channel:'sms', template:{ name }, variables }`, header `x-api-key`.
  Template names live in `src/lib/messaging/sms-templates.ts`.
- Inbound: `src/app/api/webhooks/sms/route.ts` verifies
  `v1,base64(HMAC-SHA256(whsec-key, "{id}.{timestamp}.{rawBody}"))` then calls
  `routeInboundSms` (`src/lib/messaging/sms-routing.ts`).
- Test sends without sending: add `"sandbox": true` to the request body — Sent
  validates and returns `success` without delivering or billing.
