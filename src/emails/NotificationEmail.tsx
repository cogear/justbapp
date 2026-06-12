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

export const NotificationEmail = ({
    heading = 'A quiet note from The B Life',
    bodyText = '',
    ctaLabel,
    ctaUrl,
}: {
    heading?: string;
    bodyText?: string;
    ctaLabel?: string;
    ctaUrl?: string;
}) => (
    <Html>
        <Head />
        <Preview>{heading}</Preview>
        <Tailwind
            config={{
                theme: {
                    extend: {
                        colors: {
                            primary: '#A67C52',
                            background: '#FDFCFB',
                        },
                        fontFamily: {
                            serif: ['Georgia', 'serif'],
                        },
                    },
                },
            }}
        >
            <Body className="bg-white my-auto mx-auto font-sans">
                <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
                    <Section className="mt-[32px]">
                        <Heading className="text-black text-[20px] font-serif font-normal text-center p-0 my-[24px] mx-auto">
                            {heading}
                        </Heading>
                    </Section>
                    <Text className="text-black text-[14px] leading-[24px] whitespace-pre-wrap">
                        {bodyText}
                    </Text>
                    {ctaLabel && ctaUrl && (
                        <Section className="text-center mt-[24px] mb-[32px]">
                            <Link
                                href={ctaUrl}
                                className="bg-black rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                            >
                                {ctaLabel}
                            </Link>
                        </Section>
                    )}
                    <Section className="border-t border-solid border-[#eaeaea] my-[16px] mx-0 w-full" />
                    <Text className="text-[#666666] text-[12px] leading-[20px] text-center">
                        theblife.com • breathe … you&rsquo;re here
                    </Text>
                </Container>
            </Body>
        </Tailwind>
    </Html>
);

export default NotificationEmail;
