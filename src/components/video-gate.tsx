import Link from 'next/link';
import { Lock } from 'lucide-react';

/**
 * Stands in for the video player when a lesson's video requires an account.
 * The lesson text, comments and navigation around it stay public — this panel
 * replaces the player only.
 *
 * `returnTo` is an app-relative URL *including* its query string; it is encoded
 * here exactly once, so callers pass it raw.
 */
export function VideoGate({ returnTo }: { returnTo: string }) {
    const next = encodeURIComponent(returnTo);

    return (
        <div className="w-full sm:aspect-video bg-secondary/10 backdrop-blur-md border border-border/40">
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                <span
                    aria-hidden
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary"
                >
                    <Lock size={18} />
                </span>

                <h2 className="font-georgia text-lg md:text-xl text-foreground">
                    The video is for members
                </h2>
                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Create a free account to watch. The writing below stays open to everyone.
                </p>

                <Link
                    href={`/handler/sign-up?after_auth_return_to=${next}`}
                    className="mt-1 rounded-full bg-primary px-7 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-500 hover:bg-primary/90 hover:shadow-md"
                >
                    Sign up free to watch
                </Link>

                <Link
                    href={`/sign-in?after_auth_return_to=${next}`}
                    className="text-xs text-muted-foreground transition-colors hover:text-primary"
                >
                    Already a member? Log in
                </Link>
            </div>
        </div>
    );
}
