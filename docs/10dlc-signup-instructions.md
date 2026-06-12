# 10DLC SMS Registration — Step-by-Step Instructions

**For:** The B Life (theblife.com) — community messaging hub
**AWS Service:** AWS End User Messaging (formerly Pinpoint SMS)
**Console:** https://console.aws.amazon.com/sms-voice/ — use region **us-east-1**
**Total cost:** ~$4.50 one-time + ~$3/month fixed, before per-message costs (~1¢/text)
**Timeline:** Brand approval: minutes–2 days. Campaign approval: **1–3 weeks** (the long pole — start today).

---

## Before You Start — Gather These

- [ ] **EIN** (Employer Identification Number)
- [ ] **Exact legal company name** — as it appears on your IRS CP 575 letter / tax filings.
      ⚠️ *This is the #1 rejection cause. "The B Life" only if that's the registered legal
      name — otherwise use the actual entity name (e.g., "B Life LLC").
      Each rejected resubmission costs the fee again.*
- [ ] **Business address** as registered with the IRS
- [ ] **Support email** — your @theblife.com Google Workspace address
- [ ] **Support phone** — your real phone number
- [ ] This document (for the copy-paste answers below)

---

## Step 1 — Register the Brand (~$4.50 one-time)

1. Sign in to the AWS Console → search **"End User Messaging"** → open **AWS End User Messaging SMS**
2. Confirm region is **N. Virginia (us-east-1)** (top-right dropdown)
3. Left sidebar → **Registrations** → **Create registration**
4. Registration type: **US 10DLC brand registration**
5. Fill the form:

| Field | Enter |
|---|---|
| Legal company name | *(exact IRS name — see warning above)* |
| Tax ID / EIN | *(your EIN)* |
| Entity type | Private company (or your actual entity type) |
| Vertical | Media & Entertainment (or Communication) |
| Company website | `https://theblife.com` |
| Address | *(IRS-registered business address)* |
| Support email | *(your @theblife.com address)* |
| Support phone | *(your phone)* |

6. Submit. Status appears under **Registrations** — usually approves in minutes to 2 days.

> **SKIP "brand vetting"** ($41.50) — it only buys throughput you don't need at occasional volume.

---

## Step 2 — Register the Campaign ($2/month, 1–3 week review)

*Wait until the brand shows APPROVED, then:*

1. **Registrations** → **Create registration** → **US 10DLC campaign registration**
2. Select your approved brand
3. Fill the form — copy these answers:

**Use case:**
```
Low-Volume Mixed
```
*(Do NOT pick "Standard" — that's $10/mo for throughput you don't need.)*

**Campaign description:**
```
Community platform notifications: members of theblife.com receive
direct-message notifications, verification codes, occasional event
reminders, and person-to-person invitations they can respond to.
All recipients verify their phone via one-time code and opt in
through account settings.
```

**Sample message 1:**
```
The B Life: your verification code is 123456. It expires in
15 minutes. Msg & data rates may apply.
```

**Sample message 2:**
```
Jane via The B Life: Looking forward to Thursday! — reply to
respond, or visit theblife.com/messages
```

**Sample message 3:**
```
Jane invited you to join Morning Circle on The B Life.
Accept: theblife.com/invite/abc123 — Reply STOP to opt out.
```

**How do users opt in (opt-in description):**
```
Users verify their phone number with a one-time code in account
settings at theblife.com and explicitly enable text notifications.
Invitation messages are one-time, person-triggered by an existing
member; no further messages are sent unless the recipient creates
an account and opts in.
```

**Opt-in method / keywords:** Web-based opt-in (not keyword-based)

**Subscriber opt-in / opt-out / HELP questions:** Answer **Yes** to supporting all;
STOP and HELP are handled automatically by AWS.

**HELP message:**
```
The B Life: for help visit theblife.com or email
[your @theblife.com address]. Reply STOP to opt out.
```

**Opt-out message:** accept the default STOP confirmation.

4. Submit. **This is the 1–3 week carrier review.** Check status under Registrations.

> Note: the form may show a **$50 one-time T-Mobile campaign activation fee** —
> it has been indefinitely postponed but may appear as a line item. Don't be surprised.

---

## Step 3 — Buy the Phone Number ($1/month)

*After the campaign shows APPROVED:*

1. Left sidebar → **Phone numbers** → **Request originator**
2. Country: **United States** → capabilities: **SMS**, two-way → type: **10DLC**
3. Purchase the number (~$1/mo)
4. **Associate it with your approved campaign** when prompted
   *(association can take up to ~14 days; usually much faster)*

---

## Step 4 — Enable Two-Way Messaging (replies → the app)

1. **Phone numbers** → click your new number → **Two-way SMS** section → **Enable**
2. Destination type: **Amazon SNS topic** → create new topic, name it:
   ```
   theblife-inbound-sms
   ```
3. Open the **Amazon SNS** console → Topics → `theblife-inbound-sms` → **Create subscription**:
   - Protocol: **HTTPS**
   - Endpoint: `https://theblife.com/api/webhooks/sms`
4. The website confirms the subscription automatically — refresh and the
   subscription should show **Confirmed**. (If it stays pending, tell Claude.)
5. Leave **self-managed opt-out OFF** — AWS handles STOP/HELP keywords for you.

---

## Step 5 — Flip the Switch in Vercel

1. Vercel → the justbe project → **Settings → Environment Variables**, add:

| Name | Value |
|---|---|
| `SMS_ORIGINATION_NUMBER` | your new number in +1 format, e.g. `+15551234567` |
| `AWS_ACCESS_KEY_ID` * | IAM key with `sms-voice:SendTextMessage` permission |
| `AWS_SECRET_ACCESS_KEY` * | its secret |

\* *Skip these two if the project's existing AWS credentials (used for S3) belong to
a user you can attach the SMS permission to — just add the permission to that IAM user instead.*

2. **Redeploy.** Texting lights up automatically everywhere:
   phone verification in /messages/settings, text notifications for DMs,
   and SMS invitations.

---

## Quick Reference — What Each Thing Costs

| Item | Cost |
|---|---|
| Brand registration | ~$4.50 one-time |
| Campaign (Low-Volume Mixed) | $2/month |
| Phone number | $1/month |
| Outbound text | ~1¢ each |
| Inbound text (replies) | ~0.75¢ each |
| Possible T-Mobile activation (postponed) | $50 one-time if it appears |

## If Something Gets Rejected

- **Brand rejected** → almost always a legal-name ↔ EIN mismatch. Fix the name
  to match IRS records exactly and resubmit.
- **Campaign rejected** → carriers want clearer opt-in language or tamer sample
  messages. Bring the rejection reason back to Claude and we'll rework the wording.

*Prepared 2026-06-14 · justbe repo: docs/10dlc-signup-instructions.md*
