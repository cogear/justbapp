/**
 * Sent (sent.dm) is a template-only provider — every SMS is a pre-approved
 * template, not free-form text. These are the template *names* the app sends;
 * create + submit them in the Sent dashboard (see docs/sent-sms-setup.md).
 * Names are env-overridable so you don't have to match these exactly.
 *
 * Variable convention: positional `var_1`, `var_2`, … in the order below.
 */
export const SMS_TEMPLATES = {
    /** Phone verification. var_1 = 6-digit code. (Ships approved as `sent_Verify_Code_2`.) */
    otp: process.env.SENT_TEMPLATE_OTP || 'sent_Verify_Code_2',

    /** New direct-message notification. var_1 = sender name, var_2 = conversation link. */
    newMessage: process.env.SENT_TEMPLATE_NEW_MESSAGE || 'theblife_new_message',

    /** Space invitation. var_1 = inviter name, var_2 = space name, var_3 = invite link. */
    invite: process.env.SENT_TEMPLATE_INVITE || 'theblife_invite',

    /** Event reminder / announcement. var_1 = short message, var_2 = link. */
    notification: process.env.SENT_TEMPLATE_NOTIFICATION || 'theblife_notification',

    /** Inbound auto-reply pointing back to the app. var_1 = messages link. */
    openApp: process.env.SENT_TEMPLATE_OPEN_APP || 'theblife_open_app',
} as const;
