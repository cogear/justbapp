import type { Metadata } from "next";
import { Geist, Geist_Mono, DynaPuff } from "next/font/google";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/lib/stack";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dynapuff = DynaPuff({
  variable: "--font-dynapuff",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "b. | Just Be - Intentional Living in the Modern World",
    template: "%s | b. Just Be",
  },
  description: "A digital sanctuary for intentional living. Explore wellness principles, AI-informed perspectives, community courses, and tools for a more mindful life.",
  keywords: ["intentional living", "wellness", "mindfulness", "AI for humans", "living with AI", "digital wellbeing", "just be", "the b life"],
  authors: [{ name: "David Crowell" }],
  creator: "theblife.com",
  metadataBase: new URL("https://theblife.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://theblife.com",
    siteName: "b. Just Be",
    title: "b. | Just Be - Intentional Living in the Modern World",
    description: "A digital sanctuary for intentional living. Explore wellness principles, AI-informed perspectives, and community courses.",
    images: [{ url: "/images/hero-community.jpg", width: 1200, height: 630, alt: "b. — a community for intentional living" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "b. | Just Be",
    description: "A digital sanctuary for intentional living in the modern world.",
    images: ["/images/hero-community.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: {
    canonical: "https://theblife.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://theblife.com/#website",
                  "url": "https://theblife.com",
                  "name": "b. Just Be",
                  "description": "A digital sanctuary for intentional living in the modern world",
                  "publisher": { "@id": "https://theblife.com/#organization" },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": { "@type": "EntryPoint", "urlTemplate": "https://theblife.com/news?q={search_term_string}" },
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@type": "Organization",
                  "@id": "https://theblife.com/#organization",
                  "name": "The b. Life",
                  "legalName": "Eau Gallie Solutions LLC",
                  "url": "https://theblife.com",
                  "description": "Intentional living platform combining wellness principles with AI-informed perspectives",
                  "email": "dave@theblife.com",
                  "telephone": "+1-720-252-9874",
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "1153 Bell St",
                    "addressLocality": "Melbourne",
                    "addressRegion": "FL",
                    "postalCode": "32935",
                    "addressCountry": "US",
                  },
                  "sameAs": ["https://www.youtube.com/@b.justbe", "https://shop.theblife.com"],
                },
                {
                  "@type": "Book",
                  "name": "The b. Life",
                  "author": { "@type": "Person", "name": "David Crowell" },
                  "url": "https://theblife.com/book",
                  "description": "A guide to intentional living through seven core principles",
                },
                {
                  "@type": "ItemList",
                  "name": "Courses",
                  "description": "Educational courses on AI literacy and intentional living — plus hands-on calm, third places, gathering, and comfort",
                  "itemListElement": [
                    { "@type": "Course", "name": "AI for Humans", "url": "https://theblife.com/community/ai-for-humans", "description": "A human-centered guide to understanding and working with AI", "provider": { "@id": "https://theblife.com/#organization" } },
                    { "@type": "Course", "name": "Living with AI", "url": "https://theblife.com/community/living-with-ai", "description": "Intentional living in an AI-forward world", "provider": { "@id": "https://theblife.com/#organization" } },
                    { "@type": "Course", "name": "The Quiet Crafts", "url": "https://theblife.com/community/the-quiet-crafts", "description": "Hands-on calming practice — repetition, patience, and the quiet of work your body knows how to do", "provider": { "@id": "https://theblife.com/#organization" } },
                    { "@type": "Course", "name": "Third Places", "url": "https://theblife.com/community/third-places", "description": "Finding and becoming a regular in the unhosted rooms between home and work", "provider": { "@id": "https://theblife.com/#organization" } },
                    { "@type": "Course", "name": "Private Invite Meetups", "url": "https://theblife.com/community/private-invite-meetups", "description": "Hosting as a learnable craft — the gatherings that only happen if you make them", "provider": { "@id": "https://theblife.com/#organization" } },
                    { "@type": "Course", "name": "The Comfortable Life", "url": "https://theblife.com/community/the-comfortable-life", "description": "Hygge and its cousins — how cultures around the world build comfort, and how to build yours", "provider": { "@id": "https://theblife.com/#organization" } },
                  ],
                },
                {
                  "@type": "FAQPage",
                  "mainEntity": [
                    { "@type": "Question", "name": "What is The b. Life?", "acceptedAnswer": { "@type": "Answer", "text": "The b. Life is a digital platform and philosophy centered on intentional living. It offers seven core principles — from acceptance to gratitude — along with AI-informed courses, community discussions, and personalized news to help people live more mindfully in the modern world." } },
                    { "@type": "Question", "name": "What is AI for Humans?", "acceptedAnswer": { "@type": "Answer", "text": "AI for Humans is a free course that explains artificial intelligence in plain, relatable language. It covers foundation stories, working with AI, creativity, ethics, and more — designed for people who want to understand AI without a technical background." } },
                    { "@type": "Question", "name": "What are the seven principles of The b. Life?", "acceptedAnswer": { "@type": "Answer", "text": "The seven principles are: Acceptance Not Settling, Comfort as Achievement, Quality Over Status, Slow Down Intentionally, Balance Over Burnout, Community Not Competition, and Gratitude and Small Joys." } },
                  ],
                },
              ],
            }),
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${dynapuff.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        {/* Google Tag Manager (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-0DW5BR7WLY"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-0DW5BR7WLY');
            `,
          }}
        />
        <StackProvider app={stackServerApp}>
          <StackTheme>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Header />
              <div className="flex-1">
                {children}
              </div>
              <Footer />
            </ThemeProvider>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
