/**
 * SMS message builders. Telnyx is free-form (no remote template approval), so
 * these are local render functions — the message catalog lives here, in code.
 * Variable convention: positional `var_1`, `var_2`, … in the order each expects.
 */
export type SmsVars = Record<string, string>;
export type SmsTemplate = (vars: SmsVars) => string;

export const SMS_TEMPLATES = {
    /** Phone verification. var_1 = code. */
    otp: (v: SmsVars) =>
        `The B Life: your verification code is ${v.var_1}. It expires in 15 minutes. Msg & data rates may apply. Reply STOP to opt out.`,

    /** New direct-message notification. var_1 = sender name, var_2 = conversation link. */
    newMessage: (v: SmsVars) =>
        `The B Life: New message from ${v.var_1} — open the app to read & reply: ${v.var_2}`,

    /** Space / gathering invitation. var_1 = inviter, var_2 = name, var_3 = invite link. */
    invite: (v: SmsVars) =>
        `${v.var_1} invited you to ${v.var_2} on The B Life. Accept: ${v.var_3} — Reply STOP to opt out.`,

    /** Event reminder / announcement. var_1 = short message, var_2 = link. */
    notification: (v: SmsVars) => `The B Life: ${v.var_1} ${v.var_2}`,

    /** Inbound auto-reply pointing back to the app. var_1 = messages link. */
    openApp: (v: SmsVars) => `Open The B Life to read & reply: ${v.var_1}`,
} satisfies Record<string, SmsTemplate>;
