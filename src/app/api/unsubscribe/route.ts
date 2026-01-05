import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// Generate unsubscribe token
export function generateUnsubscribeToken(email: string): string {
    const secret = process.env.UNSUBSCRIBE_SECRET || 'fallback-secret-change-me';
    return crypto
        .createHmac('sha256', secret)
        .update(email.toLowerCase())
        .digest('hex')
        .substring(0, 32);
}

// Verify unsubscribe token
function verifyUnsubscribeToken(email: string, token: string): boolean {
    const expectedToken = generateUnsubscribeToken(email);
    try {
        return crypto.timingSafeEqual(
            Buffer.from(token),
            Buffer.from(expectedToken)
        );
    } catch {
        return false;
    }
}

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email || !token) {
        return new Response(getErrorPage('Missing email or token'), {
            status: 400,
            headers: { 'Content-Type': 'text/html' }
        });
    }

    // Verify token
    if (!verifyUnsubscribeToken(email, token)) {
        return new Response(getErrorPage('Invalid unsubscribe link'), {
            status: 400,
            headers: { 'Content-Type': 'text/html' }
        });
    }

    // Unsubscribe user
    try {
        const result = await prisma.user.updateMany({
            where: { email: email.toLowerCase() },
            data: { emailActive: false }
        });

        console.log(`Unsubscribed: ${email} (${result.count} records updated)`);

        // Return success page
        return new Response(getSuccessPage(email), {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
        });
    } catch (error) {
        console.error('Failed to unsubscribe:', error);
        return new Response(getErrorPage('Failed to unsubscribe. Please try again later.'), {
            status: 500,
            headers: { 'Content-Type': 'text/html' }
        });
    }
}

function getSuccessPage(email: string): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Unsubscribed - b.</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: Georgia, serif;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 60px 40px;
                    text-align: center;
                    background: #F5F2EB;
                    color: #2D2D2D;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                h1 { 
                    font-size: 4rem; 
                    margin-bottom: 1rem;
                    font-weight: 400;
                }
                h2 { 
                    color: #8DA399; 
                    font-size: 1.75rem;
                    font-weight: 400;
                    margin-bottom: 1.5rem;
                }
                p { 
                    font-size: 1.125rem; 
                    line-height: 1.8;
                    margin-bottom: 1rem;
                }
                .email {
                    margin-top: 2rem;
                    font-size: 0.875rem;
                    opacity: 0.6;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }
                .back-link {
                    margin-top: 2rem;
                    display: inline-block;
                    color: #8DA399;
                    text-decoration: none;
                    font-size: 0.875rem;
                    padding: 0.75rem 1.5rem;
                    border: 1px solid #8DA399;
                    border-radius: 2rem;
                    transition: all 0.3s ease;
                }
                .back-link:hover {
                    background: #8DA399;
                    color: white;
                }
            </style>
        </head>
        <body>
            <div>
                <h1>b.</h1>
                <h2>You've been unsubscribed</h2>
                <p>We're sorry to see you go.</p>
                <p>You will no longer receive newsletters from us.</p>
                <p class="email">${email}</p>
                <a href="https://theblife.com" class="back-link">Return to b.</a>
            </div>
        </body>
        </html>
    `;
}

function getErrorPage(message: string): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Error - b.</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: Georgia, serif;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 60px 40px;
                    text-align: center;
                    background: #F5F2EB;
                    color: #2D2D2D;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                h1 { 
                    font-size: 4rem; 
                    margin-bottom: 1rem;
                    font-weight: 400;
                }
                h2 { 
                    color: #D4A59A; 
                    font-size: 1.75rem;
                    font-weight: 400;
                    margin-bottom: 1.5rem;
                }
                p { 
                    font-size: 1.125rem; 
                    line-height: 1.8;
                }
                .back-link {
                    margin-top: 2rem;
                    display: inline-block;
                    color: #8DA399;
                    text-decoration: none;
                    font-size: 0.875rem;
                    padding: 0.75rem 1.5rem;
                    border: 1px solid #8DA399;
                    border-radius: 2rem;
                    transition: all 0.3s ease;
                }
                .back-link:hover {
                    background: #8DA399;
                    color: white;
                }
            </style>
        </head>
        <body>
            <div>
                <h1>b.</h1>
                <h2>Oops</h2>
                <p>${message}</p>
                <a href="https://theblife.com" class="back-link">Return to b.</a>
            </div>
        </body>
        </html>
    `;
}
