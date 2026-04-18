'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { href: '/community', label: 'b.community' },
        { href: '/blog', label: 'b.blog' },
        { href: '/principles', label: 'b.principles' },
        { href: '/book', label: 'b.book' },
    ];

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                aria-label="Toggle menu"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu Panel */}
                    <div className="fixed top-14 left-0 right-0 bg-background border-b border-border/40 shadow-lg z-50 md:hidden animate-in slide-in-from-top-4 duration-300">
                        <nav className="flex flex-col p-6 space-y-4">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="text-lg font-georgia text-muted-foreground hover:text-foreground transition-colors py-2 border-b border-border/20 last:border-0"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Link
                                href="/subscribe"
                                onClick={() => setIsOpen(false)}
                                className="mt-4 px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 rounded-full transition-all text-sm font-medium shadow-sm text-center"
                            >
                                Newsletter Signup.
                            </Link>
                        </nav>
                    </div>
                </>
            )}
        </>
    );
}
