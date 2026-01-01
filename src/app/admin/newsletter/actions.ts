'use server';

import { resend } from '@/lib/resend';
import prisma from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';
import * as cheerio from 'cheerio';
import { format } from 'date-fns';
import { NewsletterEmail } from '@/emails/NewsletterEmail';
import { render } from '@react-email/render';
import React from 'react';

// Using consolidated resend client from @/lib/resend

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
            // Silence 404 and 403 as "not ready yet" rather than an error
            if (response.status !== 404 && response.status !== 403) {
                console.error(`Failed to fetch newsletter content. Status: ${response.status} URL: ${url}`);
            } else {
                console.log(`Newsletter content not available yet: ${url} (${response.status})`);
            }
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

    // Email-based admin check: Strictly limited to cogear@gmail.com
    const isAdmin = user.primaryEmail === 'cogear@gmail.com';
    if (!isAdmin) return { success: false, error: 'Unauthorized' };

    const date = new Date(dateString);
    const content = await getNewsletterContent(date);
    if (!content) return { success: false, error: 'Newsletter content not found' };

    // Fetch subscribers
    const dbUsers = await prisma.user.findMany({
        where: { email: { not: '' } },
        select: { email: true }
    });

    // Ensure the current sender is always included for verification
    const allRecipientEmails = Array.from(new Set([
        ...dbUsers.map(u => u.email),
        user.primaryEmail
    ])).filter(Boolean) as string[];

    console.log(`Targeting ${allRecipientEmails.length} recipients: ${allRecipientEmails.join(', ')}`);

    if (allRecipientEmails.length === 0) {
        return { success: false, error: 'No recipients found' };
    }

    // Fetch 7 most recent news articles with their cluster-specific headlines
    const recentArticles = await prisma.newsArticle.findMany({
        take: 7,
        orderBy: { publishedAt: 'desc' },
        include: { reframedArticles: true }
    });

    try {
        console.log(`Starting newsletter delivery for ${dateString}...`);

        // Rate limiting: Resend allows 2 requests per second
        // We'll send emails sequentially with a 600ms delay between each
        const deliveryResults: Array<{ email: string; success: boolean; id?: string; error?: any }> = [];

        for (let i = 0; i < allRecipientEmails.length; i++) {
            const email = allRecipientEmails[i];

            try {
                // Find the user's cluster for personalization
                const dbUser = await prisma.user.findUnique({
                    where: { email },
                    include: { visualProfiles: { take: 1, orderBy: { createdAt: 'desc' } } }
                });

                const cluster = dbUser?.visualProfiles?.[0]?.cluster || 'Global';

                // Map the headlines for this specific user's cluster
                const newsRecap = recentArticles.map(article => {
                    const reframed = article.reframedArticles.find(r => r.cluster === cluster);
                    return {
                        id: article.id,
                        title: reframed?.headline || article.title,
                    };
                });

                // Use React.createElement since this is a .ts file (not .tsx)
                const emailHtml = await render(React.createElement(NewsletterEmail, {
                    ...content,
                    newsRecap,
                    previewMode: false
                }));

                const response = await resend.emails.send({
                    from: 'b. | The Daily Essence <newsletter@theblife.com>',
                    to: email,
                    subject: `Today's b.brief: ${content.anchorQuote.substring(0, 50)}...`,
                    html: emailHtml,
                });

                if (response.error) {
                    console.error(`Resend API error for ${email}:`, response.error);
                    deliveryResults.push({ email, success: false, error: response.error });
                } else {
                    console.log(`Successfully sent email ID ${response.data?.id} to ${email} (${i + 1}/${allRecipientEmails.length})`);
                    deliveryResults.push({ email, success: true, id: response.data?.id });
                }
            } catch (err) {
                console.error(`Failed to execute send for ${email}:`, err);
                deliveryResults.push({ email, success: false, error: err });
            }

            // Rate limiting: Wait 600ms between emails (allows ~1.67 emails/sec, safely under 2/sec limit)
            if (i < allRecipientEmails.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 600));
            }
        }

        const succeeded = deliveryResults.filter(r => r.success).length;
        const failed = deliveryResults.filter(r => !r.success).length;
        const recipientList = allRecipientEmails.join(', ');

        console.log(`Newsletter delivery complete. Succeeded: ${succeeded}, Failed: ${failed}`);

        if (succeeded === 0 && failed > 0) {
            return { success: false, error: `All deliveries failed. Targeted: ${recipientList}` };
        }

        return {
            success: true,
            count: succeeded,
            failed,
            recipients: recipientList
        };
    } catch (error) {
        console.error('Critical failure in sendNewsletter:', error);
        return { success: false, error: 'Email delivery process crashed.' };
    }
}

export async function getNewsletterPreview(dateString: string) {
    const user = await stackServerApp.getUser();
    const date = new Date(dateString);
    const content = await getNewsletterContent(date);
    if (!content) return null;

    // Fetch the user's cluster for preview personalization
    let cluster = 'Global';
    if (user?.primaryEmail) {
        const dbUser = await prisma.user.findUnique({
            where: { email: user.primaryEmail },
            include: { visualProfiles: { take: 1, orderBy: { createdAt: 'desc' } } }
        });
        cluster = dbUser?.visualProfiles?.[0]?.cluster || 'Global';
    }

    // Fetch recent articles for the preview
    const recentArticles = await prisma.newsArticle.findMany({
        take: 7,
        orderBy: { publishedAt: 'desc' },
        include: { reframedArticles: true }
    });

    const newsRecap = recentArticles.map(article => {
        const reframed = article.reframedArticles.find(r => r.cluster === cluster);
        return {
            id: article.id,
            title: reframed?.headline || article.title,
        };
    });

    return {
        ...content,
        newsRecap
    };
}
