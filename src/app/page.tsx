import Link from "next/link";
import Image from "next/image";
import { stackServerApp } from "@/lib/stack";

export default async function Home() {
  const user = await stackServerApp.getUser();

  return (
    <main className="min-h-screen bg-background flex flex-col items-center">
      {/* Hero Section with Immersive Image */}
      <section className="relative w-full h-[70vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/hero-human.png"
          alt="Human presence and contemplation"
          fill
          className="object-cover brightness-[0.85] contrast-[1.05]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background" />

        <div className="relative z-10 text-center space-y-6 px-4">
          <h1 className="text-9xl md:text-[12rem] font-dynapuff text-white drop-shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            b.
          </h1>
          <p className="text-2xl md:text-3xl text-white/90 font-light tracking-[0.2em] uppercase drop-shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            just be
          </p>
        </div>
      </section>

      <div className="max-w-6xl w-full px-6 py-24 -mt-20 relative z-20">
        {!user ? (
          <div className="grid md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            {/* Feature Card 1: Visual Profiler */}
            <div className="group bg-secondary/10 backdrop-blur-md rounded-[3rem] border border-white/10 overflow-hidden hover:shadow-2xl transition-all duration-700">
              <div className="h-64 relative">
                <Image
                  src="/images/reflection.png"
                  alt="Quiet reflection"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 to-transparent" />
              </div>
              <div className="p-10 space-y-4">
                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl text-primary">✧</span>
                </div>
                <h2 className="text-2xl font-medium text-foreground">Discover Your Lens</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Take our signature personality assessment to reveal which cluster you fit into. Unlock a personalized experience where news and insights are adjusted specifically to your personality type.
                </p>
              </div>
            </div>

            {/* Feature Card 2: Newsletter */}
            <div className="group bg-secondary/10 backdrop-blur-md rounded-[3rem] border border-white/10 overflow-hidden hover:shadow-2xl transition-all duration-700">
              <div className="h-64 relative">
                <Image
                  src="/images/connection.png"
                  alt="Human connection"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 to-transparent" />
              </div>
              <div className="p-10 space-y-4">
                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl text-primary">✦</span>
                </div>
                <h2 className="text-2xl font-medium text-foreground">The Daily Essence</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Sign up for our daily newsletter featuring AI-filtered news, guidance on how to evaluate the day's events, and insights into the foundational b. principles.
                </p>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-center pt-8">
              <Link
                href="/handler/onboarding"
                className="
                  px-16 py-5 bg-primary text-primary-foreground rounded-full 
                  font-medium tracking-wide shadow-xl hover:shadow-2xl 
                  transition-all duration-500 hover:-translate-y-1 hover:scale-105
                  text-xl
                "
              >
                Join b.
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-12 py-12 animate-in fade-in zoom-in-95 duration-1000 delay-300">
            <div className="text-center space-y-4 max-w-2xl">
              <h2 className="text-4xl font-medium">Welcome back to the b life.</h2>
              <p className="text-xl text-muted-foreground italic">"Simplicity is the ultimate sophistication."</p>
            </div>
            <Link
              href="/handler/onboarding"
              className="
                inline-block px-16 py-5 bg-primary text-primary-foreground rounded-full 
                font-medium tracking-wide shadow-xl hover:shadow-2xl 
                transition-all duration-500 hover:-translate-y-1 hover:scale-105
                text-xl
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
