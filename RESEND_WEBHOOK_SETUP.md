# Resend Webhook Configuration

## Environment Variables

Add these to your `.env` file:

```env
# Unsubscribe Token Secret (generated with: openssl rand -hex 32)
UNSUBSCRIBE_SECRET=your-generated-secret-here

# Resend Webhook Secret (get from Resend dashboard after creating webhook)
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

## Resend Dashboard Setup

### 1. Create Webhook

1. Go to [Resend Dashboard → Webhooks](https://resend.com/webhooks)
2. Click "Add Webhook"
3. **Endpoint URL**: `https://yourdomain.com/api/webhooks/resend`
4. **Events to subscribe**:
   - ✅ `email.bounced`
   - ✅ `email.complained`
5. Click "Create"
6. Copy the **Signing Secret** (starts with `whsec_`)
7. Add to `.env` as `RESEND_WEBHOOK_SECRET`

### 2. Test Webhook

1. In Resend dashboard, go to your webhook
2. Click "Test" tab
3. Send test events for `email.bounced` and `email.complained`
4. Check your application logs to verify events are processed

## Local Testing

### Test Unsubscribe Flow

1. Send yourself a test newsletter
2. Check email for "Unsubscribe" link at bottom
3. Click the link
4. Verify you see the "You've been unsubscribed" page
5. Check database: `emailActive` should be `false` for your email
6. Send another newsletter - verify you don't receive it

### Test Webhook Locally (Optional)

Use a tool like [ngrok](https://ngrok.com/) to expose your local server:

```bash
ngrok http 3000
```

Then use the ngrok URL in Resend webhook configuration.

## Production Deployment

1. Deploy your application
2. Configure webhook in Resend dashboard with production URL
3. Add `RESEND_WEBHOOK_SECRET` to production environment variables
4. Add `UNSUBSCRIBE_SECRET` to production environment variables
5. Test unsubscribe flow in production
6. Monitor webhook logs in Resend dashboard

## Security Notes

- ✅ Webhook signatures are verified using `svix` library
- ✅ Unsubscribe tokens use HMAC-SHA256 (cannot be forged)
- ✅ Tokens are tied to specific email addresses
- ✅ Timing-safe comparison prevents timing attacks
- ⚠️  Keep `UNSUBSCRIBE_SECRET` and `RESEND_WEBHOOK_SECRET` private

## Monitoring

Check your application logs for:
- `✅ Disabled email for bounced address: email@example.com`
- `✅ Disabled email for spam complaint: email@example.com`
- `Unsubscribed: email@example.com (1 records updated)`

## Troubleshooting

**Webhook not working?**
- Verify `RESEND_WEBHOOK_SECRET` is correct
- Check webhook is active in Resend dashboard
- Check application logs for verification errors

**Unsubscribe link not working?**
- Verify `UNSUBSCRIBE_SECRET` is set
- Check token generation matches in email and endpoint
- Verify email address case sensitivity (converted to lowercase)

**TypeScript errors about `emailActive`?**
- Run `npx prisma generate` to regenerate Prisma Client
- Restart dev server
