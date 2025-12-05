'use client';

import { useStackApp } from "@stackframe/stack";
import Link from "next/link";

export function AuthButtons() {
    const app = useStackApp();
    const user = app.useUser();

    if (!user) {
        return (
            <Link
                href="/sign-in"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
                Sign In
            </Link>
        );
    }

    return (
        <button
            onClick={() => app.signOut()}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
            Sign Out
        </button>
    );
}
