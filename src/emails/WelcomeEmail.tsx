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
} from '@react-email/components';
import * as React from 'react';

export const WelcomeEmail = () => (
    <Html>
        <Head />
        <Preview>Welcome to the "b" life.</Preview>
        <Tailwind
            config={{
                theme: {
                    extend: {
                        colors: {
                            primary: '#A67C52', // Placeholder for "b-sand" or similar brand color
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
                        <Heading className="text-black text-[24px] font-serif font-normal text-center p-0 my-[30px] mx-auto">
                            Welcome to the <strong>b</strong> life.
                        </Heading>
                    </Section>
                    <Text className="text-black text-[14px] leading-[24px]">
                        Hello,
                    </Text>
                    <Text className="text-black text-[14px] leading-[24px]">
                        Thank you for joining our intentional mailing list. You are now part of a community dedicated to the radical act of <em>being</em> in an age of constant <em>doing</em>.
                    </Text>
                    <Text className="text-black text-[14px] leading-[24px]">
                        We will share quiet updates, small joys, and early access to the "b" life manifesto. No noise. Just connection.
                    </Text>
                    <Section className="text-center mt-[32px] mb-[32px]">
                        <Link
                            href="https://theblife.com"
                            className="bg-black rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                        >
                            Visit the site
                        </Link>
                    </Section>
                    <Text className="text-black text-[14px] leading-[24px]">
                        Stay intentional,<br />
                        The b Team
                    </Text>
                    <Section className="border-t border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                    <Text className="text-[#666666] text-[12px] leading-[24px] text-center">
                        theblife.com • Acceptance. Comfort. Quality. Speed. Balance. Community. Gratitude.
                    </Text>
                </Container>
            </Body>
        </Tailwind>
    </Html>
);

export default WelcomeEmail;
