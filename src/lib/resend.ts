import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
console.log('Initializing Resend client. Key present:', !!apiKey);

export const resend = new Resend(apiKey || 'missing_key');
