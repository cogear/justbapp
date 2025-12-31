import Link from 'next/link';
import React from 'react';
import { stackServerApp } from '@/lib/stack';
import { ThemeToggle } from './ThemeToggle';
import { AuthButtons } from './AuthButtons';

export async function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-6 md:gap-10">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="font-serif text-xl font-bold">b.</span>
                    </Link>
                    <nav className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                        <Link href="/visual-profile" className="transition-colors hover:text-foreground font-dynapuff">
                            b.profile
                        </Link>
                        <Link href="/news" className="transition-colors hover:text-foreground font-dynapuff">
                            b.news
                        </Link>
                        <Link href="/blog" className="transition-colors hover:text-foreground font-dynapuff">
                            b.blog
                        </Link>
                        <Link href="/principles" className="transition-colors hover:text-foreground font-dynapuff">
                            b.principles
                        </Link>
                        <Link href="/book" className="transition-colors hover:text-foreground font-dynapuff">
                            b.book
                        </Link>
                        <Link
                            href="/subscribe"
                            className="ml-2 px-6 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-full transition-all text-sm font-medium shadow-sm"
                        >
                            Sign up for the Newsletter
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <React.Suspense fallback={<div className="w-20" />}>
                        <AuthButtons />
                    </React.Suspense>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
