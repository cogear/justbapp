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

interface NewsletterConfirmationEmailProps {
    confirmationUrl: string;
}

export const NewsletterConfirmationEmail = ({
    confirmationUrl = 'https://theblife.com/newsletter/verify?token=example',
}: NewsletterConfirmationEmailProps) => (
    <Html>
        <Head />
        <Preview>Confirm your subscription to the "b" life.</Preview>
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
                        <Heading className="text-black text-[24px] font-serif font-normal text-center p-0 my-[30px] mx-auto">
                            Almost there.
                        </Heading>
                    </Section>
                    <Text className="text-black text-[14px] leading-[24px]">
                        Hello,
                    </Text>
                    <Text className="text-black text-[14px] leading-[24px]">
                        We received a request to subscribe this email address to the "b" life newsletter.
                    </Text>
                    <Text className="text-black text-[14px] leading-[24px]">
                        To confirm your subscription and ensure you aren't a robot, please click the button below.
                    </Text>
                    <Section className="text-center mt-[32px] mb-[32px]">
                        <Link
                            href={confirmationUrl}
                            className="bg-black rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                        >
                            Confirm Subscription
                        </Link>
                    </Section>
                    <Text className="text-black text-[14px] leading-[24px]">
                        If you didn't request this, you can safely ignore this email.
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

export default NewsletterConfirmationEmail;
