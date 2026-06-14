# SMS Setup — Telnyx

The B Life sends SMS (verification codes, message/invite/gathering notifications)
through **Telnyx**. Telnyx is free-form, so the app builds messages locally
(`src/lib/messaging/sms-templates.ts`) and sends them via the Messages API — no
remote template approval.

## What's provisioned (done via API)

| Thing | Value |
|---|---|
| **Brand** (own, verified) | `The B Life` — brandId `4b20019e-c804-02a1-a215-11abf8837221`, TCR `B7N5Q17`, `Eau Gallie Solutions LLC`, `PRIVATE_PROFIT`, website theblife.com, **VERIFIED** |
| **Campaign** | The B Life — `LOW_VOLUME` (ACCOUNT_NOTIFICATION + 2FA). **NOT yet created — blocked on Telnyx balance** (needs ≥$6; was $5). Re-run the campaignBuilder POST once funded. |
| **Messaging profile** | "The B Life" — `40019ec7-54f6-4046-b430-d4dd67a3c7af`, webhook → `https://theblife.com/api/webhooks/sms` |
| **Number** | `+1 321‑335‑1274` — purchased, on the profile, **not yet assigned to the campaign** (blocked until the campaign exists + is approved) |

> The original BookedNow-brand reuse was abandoned (bookednow.ai was sold). The
> BookedNow-brand campaign created earlier was deactivated. A clean **The B Life**
> brand now exists under the same LLC.

## Remaining steps

0. **Add funds to Telnyx** (Portal → Billing) — needs ≥$6 to register the campaign; suggest ~$20 to cover the campaign + number + headroom. *(This is the current blocker.)*

## Once funded + the campaign is APPROVED

Telnyx returns a "campaign still pending" error until TCR approves it (LOW_VOLUME
under an already-verified brand is usually fast — hours to a few days).

1. **Assign the number to the campaign:**
   `POST https://api.telnyx.com/v2/10dlc/phone_number_campaigns`
   `{ "phoneNumber": "+13213351274", "campaignId": "4b30019e-c7dd-2f35-4787-cfb9266ebae8" }`
   (Claude can run this once approval lands.)
2. **Get the webhook public key:** Telnyx Portal → Account Settings → Keys (the
   Ed25519 **Public Key**). Needed to verify inbound webhooks.
3. **Set env vars** (in `.env.local` and Vercel), then redeploy:
   | Var | Value |
   |---|---|
   | `TELNYX_API_KEY` | *(already set)* |
   | `TELNYX_SMS_FROM` | `+13213351274` |
   | `TELNYX_PUBLIC_KEY` | the Ed25519 public key from step 2 |
4. **Test:** verify a phone at `/messages/settings` — the code text should arrive.
   SMS is then live for the comms hub + Gatherings.

> Until `TELNYX_SMS_FROM` is set, `smsEnabled()` is false and the app cleanly
> skips SMS (email still carries everything) — so it's safe to leave it unset
> until approval + assignment are done.

## How it's wired (for engineers)

- **Send:** `src/lib/messaging/sms.ts` → `POST https://api.telnyx.com/v2/messages`
  (Bearer `TELNYX_API_KEY`, body `{ from: TELNYX_SMS_FROM, to, text }`). Message
  text is rendered by `SMS_TEMPLATES` in `src/lib/messaging/sms-templates.ts`.
- **Receive:** `src/app/api/webhooks/sms/route.ts` verifies the Telnyx Ed25519
  signature (`telnyx-signature-ed25519` + `telnyx-timestamp` over
  `{timestamp}|{rawBody}` with `TELNYX_PUBLIC_KEY`), then routes `message.received`
  events via `routeInboundSms` and correlates delivery status to `MessageDelivery`.
- STOP/HELP/START are handled by Telnyx at the messaging-profile level; inbound
  STOP also flows through `routeInboundSms` → `ContactSuppression`.

## Cost (approx)
Number ~$1/mo · LOW_VOLUME campaign ~$2/mo · ~1¢ per SMS (out/in). Brand: $0 (reused).
