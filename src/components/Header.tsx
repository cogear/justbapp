import Link from 'next/link';
import React from 'react';
import { stackServerApp } from '@/lib/stack';
import { ThemeToggle } from './ThemeToggle';
import { AuthButtons } from './AuthButtons';
import { MobileNav } from './MobileNav';
import { Youtube, Facebook, MessageCircle } from 'lucide-react';

export async function Header() {
    const stackUser = await stackServerApp.getUser().catch(() => null);
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="b-nav-content flex h-14 items-center justify-between">
                <div className="flex items-center gap-6 md:gap-10">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="font-georgia text-xl font-bold">b.</span>
                    </Link>
                    {/* Desktop Navigation - Hidden on mobile */}
                    <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground">
                        <Link href="/courses" className="transition-colors hover:text-foreground font-georgia">
                            b.courses
                        </Link>
                        <Link href="/community" className="transition-colors hover:text-foreground font-georgia">
                            b.community
                        </Link>
                        {stackUser && (
                            <Link href="/gatherings" className="transition-colors hover:text-foreground font-georgia">
                                b.gatherings
                            </Link>
                        )}
                        <Link href="/blog" className="transition-colors hover:text-foreground font-georgia">
                            b.blog
                        </Link>
                        <Link href="/principles" className="transition-colors hover:text-foreground font-georgia">
                            b.principles
                        </Link>
                        <Link href="/book" className="transition-colors hover:text-foreground font-georgia">
                            b.book
                        </Link>
                        <a
                            href="https://shop.theblife.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-foreground font-georgia"
                        >
                            b.shop
                        </a>
                        {/* Newsletter signup button removed — to be reintroduced differently. */}
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    {stackUser && (
                        <Link
                            href="/messages"
                            className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-secondary/50 rounded-full"
                            title="Messages"
                        >
                            <MessageCircle size={20} />
                        </Link>
                    )}
                    <React.Suspense fallback={<div className="w-20" />}>
                        <AuthButtons />
                    </React.Suspense>
                    <a
                        href="https://www.youtube.com/@b.justbe"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-secondary/50 rounded-full"
                        title="Follow b. on YouTube"
                    >
                        <Youtube size={20} />
                    </a>
                    <a
                        href="https://www.facebook.com/profile.php?id=61577911876279"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-secondary/50 rounded-full"
                        title="Follow b. on Facebook"
                    >
                        <Facebook size={20} />
                    </a>
                    <a
                        href="https://x.com/bjustbe42"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-secondary/50 rounded-full"
                        title="Follow b. on X"
                    >
                        <svg
                            width={20}
                            height={20}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </a>
                    <ThemeToggle />
                    {/* Mobile Navigation - Shown only on mobile */}
                    <MobileNav />
                </div>
            </div>
        </header>
    );
}
