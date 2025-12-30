'use client';

import { SignIn } from "@stackframe/stack";

export default function SignInPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 transition-colors duration-500">
            <div className="w-full max-w-md space-y-12 animate-in fade-in zoom-in-95 duration-1000">
                <header className="text-center space-y-4">
                    <h1 className="text-6xl font-dynapuff text-primary">b.</h1>
                    <p className="text-muted-foreground text-sm tracking-widest uppercase font-light">
                        Just be. For a moment.
                    </p>
                </header>

                <div className="bg-secondary/20 backdrop-blur-md rounded-[2.5rem] p-8 md:p-12 border border-border/40 shadow-sm transition-all duration-500">
                    <SignIn />
                </div>

                <footer className="text-center">
                    <p className="text-xs text-muted-foreground/50 tracking-wide">
                        Your digital sanctuary awaits.
                    </p>
                </footer>
            </div>
        </main>
    );
}

