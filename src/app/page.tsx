import Link from "next/link";
import Image from "next/image";
import { stackServerApp } from "@/lib/stack";
import { getDailyEssence } from "@/lib/api/blog";
import { AmbientScene } from "@/components/community/ambient-scene";
import { Reveal } from "@/components/reveal";
import { BUSINESS, BUSINESS_ADDRESS_ONE_LINE } from "@/lib/business";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Just Be — Intentional Living in the Modern World",
    description:
      "Learn how to use AI with clarity, and live the seven b. life principles. Six free courses and 500+ lessons, plus daily essays and a grounded community.",
    path: "/",
  }),
  // `absolute` bypasses the root layout's "%s | b. Just Be" template, which would
  // otherwise brand the homepage title twice.
  title: { absolute: "b. | Just Be - Intentional Living in the Modern World" },
};

export default async function Home() {
  const user = await stackServerApp.getUser();
  const essence = await getDailyEssence();

  return (
    <main className="min-h-screen bg-background flex flex-col items-center">
      {/* Hero — the living meadow: seeds by day, fireflies by night */}
      <section className="relative w-full h-[75vh] flex items-center justify-center overflow-hidden">
        <AmbientScene variant="hero" washClassName="bg-background/40 dark:bg-background/30" />
        {/* Dissolve the scene into the calm page below */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background pointer-events-none" />

        <div className="relative z-10 text-center space-y-6 px-4">
          <h1 className="breathe-slow text-9xl md:text-[12rem] font-georgia text-foreground animate-in fade-in slide-in-from-bottom-8 duration-1000">
            b.
          </h1>
          <p className="text-2xl md:text-3xl text-foreground/80 font-light tracking-[0.2em] uppercase animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200" style={{ animationFillMode: 'backwards' }}>
            just be
          </p>
          <p className="text-lg md:text-xl text-foreground/75 font-georgia italic max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300" style={{ animationFillMode: 'backwards' }}>
            A home for intentional living — and a practical guide to AI.
          </p>
        </div>
      </section>

      <div className="max-w-6xl w-full px-6 pt-10 pb-20 relative z-20">
        {/* Today's essence — the heartbeat of the page (renders only if published) */}
        {essence && (
          <Reveal className="relative max-w-2xl mx-auto mb-16">
            <div
              aria-hidden
              className="halo-breathe absolute -inset-8 rounded-full blur-3xl pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at center, color-mix(in oklab, #D4A59A 22%, transparent), color-mix(in oklab, #8DA399 12%, transparent) 55%, transparent 75%)',
              }}
            />
            <Link
              href="/blog"
              aria-label="Read today's b. blog"
              className="group relative block rounded-[3rem] bg-background/70 backdrop-blur-xl border border-border/50 shadow-sm p-10 md:p-12 text-center transition-all duration-500 hover:shadow-lg"
            >
              <p className="font-georgia italic text-3xl md:text-4xl text-foreground leading-snug">
                “{essence.anchorQuote}”
              </p>
              {essence.signalIntro && (
                <p className="mt-5 font-georgia text-lg md:text-xl text-foreground/80 leading-relaxed line-clamp-4">
                  {essence.signalIntro}
                </p>
              )}
              <p className="mt-6 text-[11px] uppercase tracking-[0.25em] text-primary/60 group-hover:text-primary transition-colors">
                More on today’s b.blog →
              </p>
            </Link>
          </Reveal>
        )}

        {/* Positioning paragraph */}
        <Reveal className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-lg md:text-xl text-foreground/80 leading-relaxed font-georgia">
            AI is already part of daily life. This is a place to understand it clearly, use it well, and stay grounded in what matters — seven principles for living the b. life in a world that keeps speeding up.
          </p>
        </Reveal>

        {/* Two pillar cards — shown to everyone */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Pillar A: Learn AI */}
          <Reveal>
            <div className="group bg-secondary/10 backdrop-blur-md rounded-[3rem] border border-white/10 overflow-hidden hover:shadow-2xl transition-all duration-700 h-full">
              <div className="h-64 relative">
                <Image
                  src="/images/learn-ai-card.jpg"
                  alt="Two friends learning at a sunlit kitchen table"
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
                  Six courses written for real people — two on using AI with clarity and good judgment, and four on the quieter arts: making with your hands, finding your places, gathering your people, and building comfort on purpose.
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
                  <Link
                    href="/community/the-quiet-crafts"
                    className="font-georgia text-lg text-primary hover:underline underline-offset-4"
                  >
                    The Quiet Crafts · 88 articles →
                  </Link>
                  <Link
                    href="/community/third-places"
                    className="font-georgia text-lg text-primary hover:underline underline-offset-4"
                  >
                    Third Places · 88 articles →
                  </Link>
                  <Link
                    href="/community/private-invite-meetups"
                    className="font-georgia text-lg text-primary hover:underline underline-offset-4"
                  >
                    Private Invite Meetups · 88 articles →
                  </Link>
                  <Link
                    href="/community/the-comfortable-life"
                    className="font-georgia text-lg text-primary hover:underline underline-offset-4"
                  >
                    The Comfortable Life · 88 articles →
                  </Link>
                  <Link
                    href="/courses"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors pt-1"
                  >
                    browse all courses →
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Pillar B: Live the b. life */}
          <Reveal delay={0.15}>
            <div className="group bg-secondary/10 backdrop-blur-md rounded-[3rem] border border-white/10 overflow-hidden hover:shadow-2xl transition-all duration-700 h-full">
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
          </Reveal>
        </div>

        {/* Primary CTA — sign-up prompt, shown to logged-out visitors only */}
        {!user && (
          <Reveal className="flex justify-center pt-16">
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
          </Reveal>
        )}

        {/* About + contact — brand identity for visitors (and for carrier 10DLC
            brand validation). Identity details mirror the TCR brand record. */}
        <Reveal className="mt-24 pt-16 border-t border-border/40">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-georgia text-foreground">About {BUSINESS.brandName}</h2>
            <p className="text-lg text-foreground/80 leading-relaxed font-georgia">
              {BUSINESS.displayName} is a wellness and intentional-living community founded by
              David Crowell, author of the book <em>The b. Life</em>. We publish daily essays,
              two AI-literacy courses, and the seven b. life principles — and we host a member
              community where people slow down, connect, and live with more intention. {BUSINESS.brandName} is
              operated by {BUSINESS.legalName}.
            </p>
            <address className="not-italic text-base text-muted-foreground leading-relaxed">
              {BUSINESS_ADDRESS_ONE_LINE}<br />
              <a href={`tel:${BUSINESS.phone}`} className="hover:text-foreground transition-colors">
                {BUSINESS.phoneDisplay}
              </a>
              {' · '}
              <a href={`mailto:${BUSINESS.email}`} className="hover:text-foreground transition-colors">
                {BUSINESS.email}
              </a>
            </address>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-2 text-base">
              <Link href="/about" className="font-georgia text-primary hover:underline underline-offset-4">
                More about us →
              </Link>
              <Link href="/sms" className="font-georgia text-primary hover:underline underline-offset-4">
                Get text updates →
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
