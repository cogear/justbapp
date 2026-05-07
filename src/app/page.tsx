import Link from "next/link";
import Image from "next/image";
import { stackServerApp } from "@/lib/stack";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "b. | Just Be - Intentional Living in the Modern World",
  description:
    "Learn how to use AI with clarity, and live the seven b. life principles. 180+ articles across two courses, plus daily essays and a grounded community.",
  alternates: { canonical: "https://theblife.com" },
};

export default async function Home() {
  const user = await stackServerApp.getUser();

  return (
    <main className="min-h-screen bg-background flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full h-[55vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/hero-community.jpg"
          alt="Friends sharing a meal together"
          fill
          className="object-cover brightness-[0.85] contrast-[1.05]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background" />

        <div className="relative z-10 text-center space-y-6 px-4">
          <h1 className="text-9xl md:text-[12rem] font-georgia text-white drop-shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            b.
          </h1>
          <p className="text-2xl md:text-3xl text-white/90 font-light tracking-[0.2em] uppercase drop-shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            just be
          </p>
          <p className="text-lg md:text-xl text-white/90 font-georgia italic max-w-2xl mx-auto drop-shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            A home for intentional living — and a practical guide to AI.
          </p>
        </div>
      </section>

      <div className="max-w-6xl w-full px-6 pt-10 pb-20 relative z-20">
        {/* Positioning paragraph */}
        <section className="max-w-2xl mx-auto text-center mb-16 animate-in fade-in duration-1000 delay-300">
          <p className="text-lg md:text-xl text-foreground/80 leading-relaxed font-georgia">
            AI is already part of daily life. This is a place to understand it clearly, use it well, and stay grounded in what matters — seven principles for living the b. life in a world that keeps speeding up.
          </p>
        </section>

        {!user ? (
          <>
            {/* Two pillar cards */}
            <div className="grid md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
              {/* Pillar A: Learn AI */}
              <div className="group bg-secondary/10 backdrop-blur-md rounded-[3rem] border border-white/10 overflow-hidden hover:shadow-2xl transition-all duration-700">
                <div className="h-64 relative">
                  <Image
                    src="/images/connection.png"
                    alt="Integrating AI into daily life"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 to-transparent" />
                </div>
                <div className="p-10 space-y-6">
                  <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl text-primary">✦</span>
                  </div>
                  <h2 className="text-3xl font-georgia text-foreground">Learn AI, your way.</h2>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    AI is a tool worth understanding. Our two courses are written for real people — not engineers — so you can use AI with clarity, confidence, and good judgment.
                  </p>
                  <div className="flex flex-col gap-3 pt-2">
                    <Link
                      href="/community/ai-for-humans"
                      className="font-georgia text-lg text-primary hover:underline underline-offset-4"
                    >
                      AI for Humans · 109 articles →
                    </Link>
                    <Link
                      href="/community/living-with-ai"
                      className="font-georgia text-lg text-primary hover:underline underline-offset-4"
                    >
                      Living with AI · 71 articles →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Pillar B: Live the b. life */}
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
                <div className="p-10 space-y-6">
                  <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl text-primary">✧</span>
                  </div>
                  <h2 className="text-3xl font-georgia text-foreground">Live the b. life.</h2>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Seven principles for moving through a noisy world with intention — acceptance, quality, slowness, balance, community, gratitude, and comfort as achievement.
                  </p>
                  <div className="flex flex-col gap-3 pt-2">
                    <Link
                      href="/principles"
                      className="font-georgia text-lg text-primary hover:underline underline-offset-4"
                    >
                      The Seven Principles →
                    </Link>
                    <Link
                      href="/book"
                      className="font-georgia text-lg text-primary hover:underline underline-offset-4"
                    >
                      The Book →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary offer */}
            <div className="mt-16 flex justify-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
              <Link
                href="/subscribe"
                className="group block w-full max-w-2xl rounded-3xl border border-border/60 bg-card p-8 hover:shadow-lg transition-all duration-500"
              >
                <h3 className="text-xl font-georgia text-foreground mb-3">The Daily Essence →</h3>
                <p className="text-muted-foreground leading-relaxed">
                  A daily newsletter with AI-filtered news, grounded commentary, and reminders of the b. principles — delivered once a day, no noise.
                </p>
              </Link>
            </div>

            {/* Primary CTA */}
            <div className="flex justify-center pt-16">
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
          </>
        ) : (
          <div className="flex flex-col items-center gap-10 py-12 animate-in fade-in zoom-in-95 duration-1000 delay-300">
            <div className="text-center space-y-4 max-w-2xl">
              <h2 className="text-4xl font-medium font-georgia">Welcome back to the b life.</h2>
              <p className="text-xl text-muted-foreground italic">
                &ldquo;Simplicity is the ultimate sophistication.&rdquo;
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <Link
                href="/community/ai-for-humans"
                className="font-georgia text-lg text-primary hover:underline underline-offset-4"
              >
                Continue in AI for Humans →
              </Link>
              <Link
                href="/community/living-with-ai"
                className="font-georgia text-lg text-primary hover:underline underline-offset-4"
              >
                Continue in Living with AI →
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
