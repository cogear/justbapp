'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { href: '/courses', label: 'b.courses' },
        { href: '/community', label: 'b.community' },
        { href: '/gatherings', label: 'b.gatherings' },
        { href: '/blog', label: 'b.blog' },
        { href: '/principles', label: 'b.principles' },
        { href: '/book', label: 'b.book' },
        { href: 'https://shop.theblife.com', label: 'b.shop', external: true },
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
                            {links.map((link) =>
                                link.external ? (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setIsOpen(false)}
                                        className="text-lg font-georgia text-muted-foreground hover:text-foreground transition-colors py-2 border-b border-border/20 last:border-0"
                                    >
                                        {link.label}
                                    </a>
                                ) : (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className="text-lg font-georgia text-muted-foreground hover:text-foreground transition-colors py-2 border-b border-border/20 last:border-0"
                                    >
                                        {link.label}
                                    </Link>
                                )
                            )}
                            {/* Newsletter signup button removed — to be reintroduced differently. */}
                        </nav>
                    </div>
                </>
            )}
        </>
    );
}
