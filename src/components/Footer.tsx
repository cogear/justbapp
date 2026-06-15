import Link from 'next/link';
import React from 'react';
import { BUSINESS, BUSINESS_ADDRESS_ONE_LINE } from '@/lib/business';

export function Footer() {
    return (
        <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-12">
            <div className="b-nav-content mb-10 text-center">
                <p className="font-georgia text-lg md:text-3xl text-foreground/80 tracking-wide">
                    breathe&nbsp;… you&rsquo;re here
                </p>
            </div>
            <div className="b-nav-content flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex flex-col items-center md:items-start gap-2">
                    <Link href="/" className="font-georgia text-xl font-bold">b.</Link>
                    <p className="text-muted-foreground text-xs font-light tracking-widest uppercase">
                        A digital sanctuary.
                    </p>
                </div>

                <nav className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground">
                    <Link href="/about" className="transition-colors hover:text-foreground">
                        About
                    </Link>
                    <Link href="/privacy" className="transition-colors hover:text-foreground">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="transition-colors hover:text-foreground">
                        Terms
                    </Link>
                    <Link href="/principles" className="transition-colors hover:text-foreground">
                        Principles
                    </Link>
                    <Link href="/blog" className="transition-colors hover:text-foreground">
                        Blog
                    </Link>
                    <Link href="/sms" className="transition-colors hover:text-foreground">
                        Text Updates
                    </Link>
                    <a
                        href={`mailto:${BUSINESS.email}`}
                        className="transition-colors hover:text-foreground"
                    >
                        Contact
                    </a>
                </nav>

                <div className="text-[10px] text-muted-foreground/40 tracking-[0.3em] uppercase">
                    &copy; {new Date().getFullYear()} just be.
                </div>
            </div>

            {/* Business identity — required for carrier (10DLC) brand validation.
                Must match the brand registered with TCR. See src/lib/business.ts */}
            <address className="b-nav-content mt-10 pt-8 border-t border-border/30 not-italic text-center md:text-left">
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                    <span className="font-medium text-muted-foreground">{BUSINESS.brandName}</span>
                    {' '}is operated by {BUSINESS.legalName}.
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70 leading-relaxed">
                    {BUSINESS_ADDRESS_ONE_LINE}
                    {' · '}
                    <a href={`tel:${BUSINESS.phone}`} className="hover:text-foreground transition-colors">
                        {BUSINESS.phoneDisplay}
                    </a>
                    {' · '}
                    <a href={`mailto:${BUSINESS.email}`} className="hover:text-foreground transition-colors">
                        {BUSINESS.email}
                    </a>
                </p>
            </address>
        </footer>
    );
}
