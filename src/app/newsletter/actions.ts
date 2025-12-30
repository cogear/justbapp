'use server';

import { Resend } from 'resend';
import prisma from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';
import * as cheerio from 'cheerio';
import { format } from 'date-fns';
import { NewsletterEmail } from '@/emails/NewsletterEmail';
import { render } from '@react-email/render';

const resend = new Resend(process.env.RESEND_API_KEY);

async function getNewsletterContent(date: Date) {
    // Ensure we use UTC parts to match S3 path structure (YYYY/MM/DD)
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const url = `https://justbblog.s3.amazonaws.com/blog/${year}/${month}/${day}/index.html`;

    console.log(`Fetching newsletter content from: ${url}`);

    try {
        const response = await fetch(url, { next: { revalidate: 3600 } });
        if (!response.ok) {
            console.error(`Failed to fetch newsletter content. Status: ${response.status} URL: ${url}`);
            return null;
        }
        const html = await response.text();
        const $ = cheerio.load(html);

        const content = {
            date: $('.blog-date').text().trim(),
            heroImage: $('.hero-image').attr('src'),
            anchorQuote: $('.anchor-quote').text().trim().replace(/^"|"$/g, ''),
            anchorElaboration: $('.anchor-elaboration').text().trim(),
            signalTitle: $('.signal-article-title').text().trim(),
            signalGist: $('.signal-gist').text().trim(),
            bridgeContent: $('.bridge-box p').text().trim(),
            applicationInternal: $('.application-card:contains("Internal") .application-text').text().trim(),
            applicationExternal: $('.application-card:contains("External") .application-text').text().trim(),
            closingSummary: $('.closing-summary').text().trim(),
            permissionStatement: $('.permission-text').text().trim().replace(/^"|"$/g, ''),
        };

        if (!content.date && !content.anchorQuote) {
            console.error(`Newsletter content parsed but found empty for URL: ${url}`);
            return null;
        }

        return content;
    } catch (error) {
        console.error('Failed to fetch newsletter content for parsing:', error);
        return null;
    }
}

export async function sendNewsletter(dateString: string) {
    const user = await stackServerApp.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    // Email-based admin check
    const isAdmin = user.primaryEmail === 'david@cogear.com' || user.primaryEmail === 'davidcrowell@gmail.com';
    if (!isAdmin) return { success: false, error: 'Unauthorized' };

    const date = new Date(dateString);
    const content = await getNewsletterContent(date);
    if (!content) return { success: false, error: 'Newsletter content not found' };

    // Fetch subscribers
    // Assuming subscribers are just users for now, or we can filter by a subscription flag if added
    const users = await prisma.user.findMany({
        where: { email: { not: '' } }
    });

    if (users.length === 0) return { success: false, error: 'No subscribers found' };

    try {
        // In a real app, you might want to batch these or use a loop with rate limiting
        // For now, we'll send to all found users
        const results = await Promise.all(users.map(async (u) => {
            return resend.emails.send({
                from: 'b. | The Daily Essence <newsletter@justbblog.com>',
                to: u.email,
                subject: `Today's b.brief: ${content.anchorQuote.substring(0, 50)}...`,
                react: NewsletterEmail(content),
            });
        }));

        console.log(`Newsletter sent to ${results.length} users.`);
        return { success: true, count: results.length };
    } catch (error) {
        console.error('Failed to send newsletter:', error);
        return { success: false, error: 'Email delivery failed' };
    }
}

export async function getNewsletterPreview(dateString: string) {
    const date = new Date(dateString);
    const content = await getNewsletterContent(date);
    return content;
}
