import type { Metadata } from "next";
import { Geist, Geist_Mono, DynaPuff } from "next/font/google";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/lib/stack";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/Header";

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
  title: "b. | Just Be",
  description: "A digital sanctuary for the modern world",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dynapuff.variable} antialiased bg-background text-foreground`}
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
              {children}
            </ThemeProvider>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
