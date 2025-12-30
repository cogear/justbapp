import Link from "next/link";
import { stackServerApp } from "@/lib/stack";

export default async function Home() {
  const user = await stackServerApp.getUser();

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-12 max-w-4xl w-full">
        <div className="space-y-4">
          <h1 className="text-8xl font-dynapuff text-primary animate-in fade-in slide-in-from-bottom-4 duration-1000">b.</h1>
          <p className="text-2xl text-muted-foreground font-light tracking-widest uppercase animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
            just be
          </p>
        </div>

        {!user ? (
          <div className="grid md:grid-cols-2 gap-8 text-left animate-in fade-in zoom-in-95 duration-1000 delay-300">
            <div className="bg-secondary/20 p-8 rounded-[2.5rem] border border-border/40 backdrop-blur-sm space-y-4 hover:shadow-lg transition-all duration-500">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl text-primary">✧</span>
              </div>
              <h2 className="text-xl font-medium text-foreground">Discover Your Lens</h2>
              <p className="text-muted-foreground leading-relaxed">
                Take our signature personality assessment to reveal which cluster you fit into. Unlock a personalized experience where news and insights are adjusted specifically to your personality type.
              </p>
            </div>

            <div className="bg-secondary/20 p-8 rounded-[2.5rem] border border-border/40 backdrop-blur-sm space-y-4 hover:shadow-lg transition-all duration-500">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl text-primary">✦</span>
              </div>
              <h2 className="text-xl font-medium text-foreground">The Daily Essence</h2>
              <p className="text-muted-foreground leading-relaxed">
                Sign up for our daily newsletter featuring AI-filtered news, guidance on how to evaluate the day's events, and insights into the foundational b. principles.
              </p>
            </div>

            <div className="md:col-span-2 flex justify-center pt-4">
              <Link
                href="/handler/onboarding"
                className="
                  px-12 py-4 bg-primary text-primary-foreground rounded-full 
                  font-medium tracking-wide shadow-md hover:shadow-xl 
                  transition-all duration-300 hover:-translate-y-1
                  text-lg
                "
              >
                Join b.
              </Link>
            </div>
          </div>
        ) : (
          <div className="pt-8 animate-in fade-in zoom-in-95 duration-1000 delay-300">
            <Link
              href="/handler/onboarding"
              className="
                inline-block px-12 py-4 bg-primary text-primary-foreground rounded-full 
                font-medium tracking-wide shadow-md hover:shadow-lg 
                transition-all duration-300 hover:-translate-y-0.5
              "
            >
              Check In
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
