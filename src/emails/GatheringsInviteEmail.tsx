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

export const GatheringsInviteEmail = ({
    inviterName = 'A friend',
    gatheringName = 'a gathering',
    personalNote,
    inviteUrl = 'https://theblife.com/gatherings',
}: {
    inviterName?: string;
    gatheringName?: string;
    personalNote?: string | null;
    inviteUrl?: string;
}) => (
    <Html>
        <Head />
        <Preview>{`${inviterName} invited you to ${gatheringName}`}</Preview>
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
                        <Heading className="text-black text-[20px] font-serif font-normal text-center p-0 my-[24px] mx-auto">
                            {inviterName} invited you to
                            <br />
                            <strong>{gatheringName}</strong>
                        </Heading>
                    </Section>
                    {personalNote && (
                        <Section className="bg-[#FDFCFB] border border-solid border-[#eaeaea] rounded p-[16px]">
                            <Text className="text-black text-[14px] leading-[24px] italic m-0">
                                &ldquo;{personalNote}&rdquo;
                            </Text>
                        </Section>
                    )}
                    <Text className="text-black text-[14px] leading-[24px] text-center mt-[16px]">
                        A standing invitation to gather — share a meal, a walk, a table. RSVP and
                        see when you&rsquo;re next meeting up.
                    </Text>
                    <Section className="text-center mt-[24px] mb-[32px]">
                        <Link
                            href={inviteUrl}
                            className="bg-black rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                        >
                            Join &amp; RSVP
                        </Link>
                    </Section>
                    <Section className="border-t border-solid border-[#eaeaea] my-[16px] mx-0 w-full" />
                    <Text className="text-[#666666] text-[12px] leading-[20px] text-center">
                        If this isn&rsquo;t for you, simply ignore this email.
                        <br />
                        theblife.com • breathe … you&rsquo;re here
                    </Text>
                </Container>
            </Body>
        </Tailwind>
    </Html>
);

export default GatheringsInviteEmail;
