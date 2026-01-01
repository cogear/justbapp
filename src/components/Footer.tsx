import Link from 'next/link';
import React from 'react';

export function Footer() {
    return (
        <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-12">
            <div className="b-nav-content flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex flex-col items-center md:items-start gap-2">
                    <Link href="/" className="font-georgia text-xl font-bold">b.</Link>
                    <p className="text-muted-foreground text-xs font-light tracking-widest uppercase">
                        A digital sanctuary.
                    </p>
                </div>

                <nav className="flex items-center gap-8 text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground">
                    <Link href="/privacy" className="transition-colors hover:text-foreground">
                        Privacy Policy
                    </Link>
                    <Link href="/principles" className="transition-colors hover:text-foreground">
                        Principles
                    </Link>
                    <Link href="/blog" className="transition-colors hover:text-foreground">
                        Blog
                    </Link>
                    <a
                        href="mailto:hello@theblife.com"
                        className="transition-colors hover:text-foreground"
                    >
                        Contact
                    </a>
                </nav>

                <div className="text-[10px] text-muted-foreground/40 tracking-[0.3em] uppercase">
                    &copy; {new Date().getFullYear()} just be.
                </div>
            </div>
        </footer>
    );
}
