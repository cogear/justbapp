import { Resend } from 'resend';

let resendInstance: Resend | null = null;

export const getResend = () => {
    if (!resendInstance) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.error('RESEND_API_KEY is missing');
            throw new Error('Missing Resend API key');
        }
        resendInstance = new Resend(apiKey);
    }
    return resendInstance;
};

// Deprecated: Use getResend() instead. 
// Adding a proxy to support existing imports while migration happens
export const resend = new Proxy({} as Resend, {
    get: (target, prop, receiver) => {
        return Reflect.get(getResend(), prop, receiver);
    }
});
