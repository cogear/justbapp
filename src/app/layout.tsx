import type { Metadata } from "next";
import { Geist, Geist_Mono, DynaPuff } from "next/font/google";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/lib/stack";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/json-ld";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { authorSchema, graph, organizationSchema, websiteSchema } from "@/lib/seo/schema";

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
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "b. | Just Be",
    description: "A digital sanctuary for intentional living in the modern world.",
    images: [DEFAULT_OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  // NOTE: deliberately no `alternates.canonical` here. App Router inherits
  // metadata down the layout tree, so a canonical set at the root makes every
  // page that doesn't override it declare itself a duplicate of the homepage.
  // Each route sets its own via `buildMetadata({ path })`.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Only site-wide identity lives here. Book -> /book, the course list ->
          /community (built from the DB), and per-route Course/Article/Breadcrumb
          nodes live on the routes they describe. The old FAQPage node was dropped:
          Google restricted FAQ rich results to gov/health sites in Aug 2023, and
          emitting it on every page — where those answers aren't visible — is a
          structured-data policy violation.
        */}
        <JsonLd data={graph(websiteSchema(), organizationSchema(), authorSchema())} />
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
