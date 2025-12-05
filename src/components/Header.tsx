import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { AuthButtons } from './AuthButtons';

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-6 md:gap-10">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="font-serif text-xl font-bold">b.</span>
                    </Link>
                    <nav className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                        <Link href="/visual-profile" className="transition-colors hover:text-foreground">
                            Profile
                        </Link>
                        <Link href="/news" className="transition-colors hover:text-foreground">
                            News
                        </Link>
                        <Link href="/events" className="transition-colors hover:text-foreground">
                            Events
                        </Link>
                        <Link href="/principles" className="transition-colors hover:text-foreground">
                            Principles
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <AuthButtons />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
