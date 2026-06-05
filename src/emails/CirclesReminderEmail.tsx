import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Tailwind,
} from '@react-email/components';
import * as React from 'react';

export type CirclesReminderKind = 'pre_meetup' | 'rsvp_cutoff' | 'decision_close';

export interface CirclesReminderEmailProps {
    kind: CirclesReminderKind;
    groupName: string;
    /** Meetup start, pre-formatted in the group's timezone (e.g. "Thursday, Jul 2 at 6:30 PM EDT"). */
    startsAtFormatted: string;
    ctaUrl?: string;
}

const COPY: Record<CirclesReminderKind, { preview: string; heading: string; body: string; cta: string }> = {
    pre_meetup: {
        preview: 'See you soon.',
        heading: 'See you soon',
        body: 'A quick reminder that your circle is meeting up. You said you would be there.',
        cta: 'View details',
    },
    rsvp_cutoff: {
        preview: 'RSVP closes soon.',
        heading: 'RSVP closes soon',
        body: "Your circle is gathering and we haven't heard from you yet. Let everyone know if you can make it.",
        cta: 'RSVP now',
    },
    decision_close: {
        preview: 'Help pick the spot.',
        heading: 'Help pick the spot',
        body: "Your circle is choosing where to meet and voting closes soon. Cast your vote so the plan can be set.",
        cta: 'Vote now',
    },
};

export const CirclesReminderEmail = ({
    kind,
    groupName,
    startsAtFormatted,
    ctaUrl = 'https://theblife.com',
}: CirclesReminderEmailProps) => {
    const copy = COPY[kind];
    return (
        <Html>
            <Head />
            <Preview>{copy.preview}</Preview>
            <Tailwind
                config={{
                    theme: {
                        extend: {
                            colors: { primary: '#A67C52', background: '#FDFCFB' },
                            fontFamily: { serif: ['Georgia', 'serif'] },
                        },
                    },
                }}
            >
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
                        <Section className="mt-[32px]">
                            <Heading className="text-black text-[24px] font-serif font-normal text-center p-0 my-[30px] mx-auto">
                                {copy.heading}
                            </Heading>
                        </Section>
                        <Text className="text-black text-[14px] leading-[24px]">
                            <strong>{groupName}</strong>
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            {startsAtFormatted}
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            {copy.body}
                        </Text>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Link
                                href={ctaUrl}
                                className="bg-black rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                            >
                                {copy.cta}
                            </Link>
                        </Section>
                        <Section className="border-t border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Text className="text-[#666666] text-[12px] leading-[24px] text-center">
                            theblife.com • the people you keep showing up for
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default CirclesReminderEmail;
