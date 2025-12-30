import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Tailwind,
    Hr,
} from '@react-email/components';
import * as React from 'react';

interface NewsletterEmailProps {
    date: string;
    heroImage?: string;
    anchorQuote?: string;
    anchorElaboration?: string;
    signalTitle?: string;
    signalGist?: string;
    bridgeContent?: string;
    applicationInternal?: string;
    applicationExternal?: string;
    closingSummary?: string;
    permissionStatement?: string;
}

export const NewsletterEmail = ({
    date = "Tuesday, December 30, 2025",
    heroImage = "https://justbblog.s3.amazonaws.com/newsletter/2025/12/30/01-anchor-image.png",
    anchorQuote = "A balanced day doesn’t feel like a victory lap—it feels like you can still hear yourself.",
    anchorElaboration = "What if balance isn’t a perfect schedule, but a steady inner volume?",
    signalTitle = "Amazon Employees Warn Against Rapid AI Expansion",
    signalGist = "More than 1,000 Amazon employees have added their names to an open letter pushing back on the company’s rapid AI expansion.",
    bridgeContent = "This isn’t just a workplace story—it’s a human pacing story.",
    applicationInternal = "Consider a quick 'energy audit': On a scale of 1–10, how full is your inner battery right now?",
    applicationExternal = "",
    closingSummary = "Today we explored how the push for faster, louder progress can quietly cost us our own rhythm.",
    permissionStatement = "You are allowed to choose sustainability over burnout.",
}: NewsletterEmailProps) => (
    <Html>
        <Head />
        <Preview>Your Daily b.brief: {date}</Preview>
        <Tailwind
            config={{
                theme: {
                    extend: {
                        colors: {
                            background: '#F5F2EB',
                            primary: '#8DA399',
                            charcoal: '#2D2D2D',
                        },
                        fontFamily: {
                            serif: ['Georgia', 'serif'],
                        },
                    },
                },
            }}
        >
            <Body className="bg-background my-auto mx-auto font-sans text-charcoal">
                <Container className="border border-solid border-[#E0E6E6] rounded-[32px] my-[40px] mx-auto p-[0px] w-[600px] overflow-hidden bg-white shadow-sm">
                    {/* Header */}
                    <Section className="pt-[40px] px-[40px] text-center">
                        <Text className="text-[32px] font-normal m-0 p-0 mb-[8px] font-serif" style={{ fontFamily: 'DynaPuff, Arial, sans-serif' }}>
                            <strong>b.</strong>
                        </Text>
                        <Text className="text-[#888888] text-[12px] uppercase tracking-[0.2em] m-0 mb-[24px]">
                            {date}
                        </Text>
                    </Section>

                    {/* Hero Image */}
                    {heroImage && (
                        <Section className="px-[20px]">
                            <Img
                                src={heroImage}
                                alt="Daily Anchor"
                                width="560"
                                className="rounded-[20px] mx-auto"
                            />
                        </Section>
                    )}

                    {/* Content Section */}
                    <Section className="px-[40px] py-[32px]">
                        {/* Anchor */}
                        <Section className="mb-[32px]">
                            <Text className="text-[12px] text-primary uppercase font-bold tracking-widest mb-[8px]">The Daily Anchor</Text>
                            <Text className="text-[20px] font-serif italic border-l-4 border-primary pl-[16px] py-[4px] my-[16px]">
                                "{anchorQuote}"
                            </Text>
                            <Text className="text-[15px] leading-[24px]">
                                {anchorElaboration}
                            </Text>
                        </Section>

                        <Hr className="border-[#E0E6E6] my-[32px]" />

                        {/* Signal */}
                        {signalTitle && (
                            <Section className="mb-[32px]">
                                <Text className="text-[12px] text-primary uppercase font-bold tracking-widest mb-[8px]">The Signal</Text>
                                <Heading className="text-[20px] font-serif font-semibold mt-[8px] mb-[16px]">
                                    {signalTitle}
                                </Heading>
                                <Text className="text-[15px] leading-[24px]">
                                    {signalGist}
                                </Text>
                            </Section>
                        )}

                        {/* Bridge */}
                        {bridgeContent && (
                            <Section className="bg-[#F9FBFB] p-[24px] rounded-[16px] mb-[32px] border border-[#E0E6E6]">
                                <Text className="text-[12px] text-primary uppercase font-bold tracking-widest mb-[8px]">The Bridge</Text>
                                <Text className="text-[15px] leading-[24px] m-0">
                                    {bridgeContent}
                                </Text>
                            </Section>
                        )}

                        <Hr className="border-[#E0E6E6] my-[32px]" />

                        {/* Application */}
                        {(applicationInternal || applicationExternal) && (
                            <Section className="mb-[32px]">
                                <Text className="text-[12px] text-primary uppercase font-bold tracking-widest mb-[16px]">The Application</Text>
                                <Section className="bg-[#FDFCFB] p-[24px] rounded-[16px] border border-[#E0E6E6]">
                                    {applicationInternal && (
                                        <Section className="mb-[16px]">
                                            <Text className="text-[11px] uppercase font-bold text-[#888888] mb-[4px]">Internal (Mindset)</Text>
                                            <Text className="text-[14px] leading-[22px] m-0">
                                                {applicationInternal}
                                            </Text>
                                        </Section>
                                    )}
                                    {applicationExternal && (
                                        <Section>
                                            <Text className="text-[11px] uppercase font-bold text-[#888888] mb-[4px]">External (Action)</Text>
                                            <Text className="text-[14px] leading-[22px] m-0">
                                                {applicationExternal}
                                            </Text>
                                        </Section>
                                    )}
                                </Section>
                            </Section>
                        )}

                        {/* Closing */}
                        <Section className="mt-[48px] text-center px-[20px]">
                            <Text className="text-[14px] leading-[22px] text-[#666666] italic mb-[24px]">
                                {closingSummary}
                            </Text>
                            <Section className="bg-primary p-[2px] w-[40px] mx-auto rounded-full mb-[24px]" />
                            <Text className="text-[18px] font-serif text-charcoal mb-[32px]">
                                "{permissionStatement}"
                            </Text>
                        </Section>
                    </Section>

                    {/* Footer */}
                    <Section className="bg-[#F9FBFB] p-[40px] text-center border-t border-[#E0E6E6]">
                        <Text className="text-[20px] font-serif m-0 mb-[8px]" style={{ fontFamily: 'Arial, sans-serif' }}>
                            <strong>b.</strong>
                        </Text>
                        <Text className="text-[#888888] text-[12px] m-0 mb-[16px]">
                            Just be.
                        </Text>
                        <Link
                            href="https://theblife.com"
                            className="text-[#8DA399] text-[12px] underline"
                        >
                            theblife.com
                        </Link>
                    </Section>
                </Container>
            </Body>
        </Tailwind>
    </Html>
);

export default NewsletterEmail;
