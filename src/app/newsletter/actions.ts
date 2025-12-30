'use server';

import { Resend } from 'resend';
import prisma from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';
import * as cheerio from 'cheerio';
import { format } from 'date-fns';
import { NewsletterEmail } from '@/emails/NewsletterEmail';
import { render } from '@react-email/render';
import React from 'react';

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
    const isAdmin = user.primaryEmail === 'david@cogear.com' ||
        user.primaryEmail === 'davidcrowell@gmail.com' ||
        user.primaryEmail === 'cogear@gmail.com';
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

    try {
        console.log(`Starting newsletter delivery for ${dateString}...`);

        const deliveryResults = await Promise.allSettled(allRecipientEmails.map(async (email) => {
            try {
                // Use React.createElement since this is a .ts file (not .tsx)
                const emailHtml = await render(React.createElement(NewsletterEmail, {
                    ...content,
                    previewMode: false
                }));

                const response = await resend.emails.send({
                    from: 'onboarding@resend.dev', // Strict sender for sandbox
                    to: email,
                    subject: `Today's b.brief: ${content.anchorQuote.substring(0, 50)}...`,
                    html: emailHtml,
                });

                if (response.error) {
                    console.error(`Resend API error for ${email}:`, response.error);
                    throw response.error;
                }

                console.log(`Successfully sent email ID ${response.data?.id} to ${email}`);
                return { email: email, success: true, id: response.data?.id };
            } catch (err) {
                console.error(`Failed to execute send for ${email}:`, err);
                throw err;
            }
        }));

        const succeeded = deliveryResults.filter(r => r.status === 'fulfilled').length;
        const failed = deliveryResults.filter(r => r.status === 'rejected').length;
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
    const date = new Date(dateString);
    const content = await getNewsletterContent(date);
    return content;
}
