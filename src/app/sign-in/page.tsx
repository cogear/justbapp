'use client';

import { SignIn } from "@stackframe/stack";

export default function SignInPage() {
    return (
        <main className="min-h-screen bg-b-sand flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8">
                <header className="text-center space-y-4">
                    <h1 className="text-4xl font-serif text-b-charcoal">b.</h1>
                    <p className="text-b-charcoal/60 text-sm tracking-wide">
                        Just be. For a moment.
                    </p>
                </header>

                <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 shadow-sm">
                    <SignIn />
                </div>
            </div>
        </main>
    );
}
