import Image from 'next/image';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { AmbientScene } from '@/components/community/ambient-scene';
import { ThreeDBook } from '@/components/ThreeDBook';
import { Reveal } from '@/components/reveal';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/json-ld';
import { buildMetadata, absoluteUrl } from '@/lib/seo';
import { AUTHOR_ID, ORG_ID, graph } from '@/lib/seo/schema';

export const metadata: Metadata = buildMetadata({
    title: "The b. Life Book",
    description: "A guide to intentional living through seven core principles by David Crowell. Discover how to slow down, find quality over status, and embrace gratitude in everyday life.",
    path: "/book",
    image: { url: "/images/b-book-cover-new.jpg" },
});

const AMAZON_URL = 'https://amzn.to/3YdE345';

/** Moved off the root layout, where it was emitted on every page of the site. */
const bookSchema = {
    '@type': 'Book',
    '@id': absoluteUrl('/book') + '#book',
    name: 'The b. Life',
    url: absoluteUrl('/book'),
    description: 'A guide to intentional living through seven core principles',
    author: { '@id': AUTHOR_ID },
    publisher: { '@id': ORG_ID },
    inLanguage: 'en-US',
    image: absoluteUrl('/images/b-book-cover-new.jpg'),
    workExample: [
        {
            '@type': 'Book',
            bookFormat: 'https://schema.org/Paperback',
            inLanguage: 'en-US',
            potentialAction: { '@type': 'ReadAction', target: AMAZON_URL },
        },
    ],
};

/** The pulsing clay/sage halo used behind spotlight moments. */
function Halo() {
    return (
        <div
            aria-hidden
            className="halo-breathe absolute -inset-8 rounded-full blur-3xl pointer-events-none"
            style={{
                background:
                    'radial-gradient(ellipse at center, color-mix(in oklab, #D4A59A 22%, transparent), color-mix(in oklab, #8DA399 12%, transparent) 55%, transparent 75%)',
            }}
        />
    );
}

export default function BookPage() {
    return (
        <main className="flex min-h-screen flex-col items-center bg-background text-foreground transition-colors duration-500">
            <JsonLd data={graph(bookSchema)} />

            {/* Hero — the book standing in the living meadow */}
            <section className="w-full relative flex flex-col md:flex-row items-center justify-center min-h-[85vh] px-6 py-20 overflow-hidden">
                <AmbientScene variant="hero" washClassName="bg-background/40 dark:bg-background/30" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background pointer-events-none" />

                {/* The book itself */}
                <div className="md:w-1/2 flex justify-center items-center my-10 md:my-0 relative z-10 animate-in fade-in zoom-in-95 duration-1000">
                    <a
                        href={AMAZON_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Get The b Life book on Amazon"
                        className="float-gentle block scale-75 sm:scale-90 md:scale-100 hover:opacity-95 transition-opacity"
                    >
                        <ThreeDBook coverImage="/images/b-book-cover-new.jpg" interactive />
                    </a>
                </div>

                {/* Hero Text */}
                <div className="md:w-1/2 flex flex-col items-start space-y-8 max-w-xl md:pl-10 relative z-10">
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground font-georgia animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        What AI Can&apos;t Replace: <span className="text-primary italic">You.</span>
                    </h2>
                    <p
                        className="text-xl md:text-2xl text-foreground/75 font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200"
                        style={{ animationFillMode: 'backwards' }}
                    >
                        Robots can do. Humans can be. In the age of the algorithm, discovering your sustainable self is the ultimate act of rebellion.
                    </p>
                    <div
                        className="flex flex-col sm:flex-row gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300"
                        style={{ animationFillMode: 'backwards' }}
                    >
                        <a
                            href={AMAZON_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-4 bg-primary text-primary-foreground text-lg rounded-full shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all font-medium text-center"
                        >
                            Get the Book
                        </a>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">
                        As an Amazon Associate I earn from qualifying purchases.
                    </p>
                </div>
            </section>

            {/* Anchor quote — the page's heartbeat */}
            <section className="w-full py-24 px-6">
                <Reveal className="relative max-w-4xl mx-auto text-center space-y-12">
                    <Halo />
                    <blockquote className="relative text-3xl md:text-4xl font-georgia italic text-foreground leading-normal">
                        &ldquo;The machine hums with anxiety. You don&apos;t have to.&rdquo;
                    </blockquote>
                    <div className="relative w-24 h-1 bg-accent mx-auto rounded-full"></div>
                    <p className="relative text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        <b>The b Life</b> isn&apos;t just about slowing down; it&apos;s about standing up. Standing up for the parts of us that no code can replicate: our capacity for genuine connection, our ability to feel deeply, and the power of simply <i>being</i> in a world obsessed with <i>doing</i>.
                    </p>
                </Reveal>
            </section>

            {/* The Philosophy — continuous narrative, breathing in on scroll */}
            <section className="w-full py-24 px-6">
                <div className="max-w-3xl mx-auto space-y-24">

                    {/* Intro / Acceptance */}
                    <Reveal>
                        <div className="prose prose-xl dark:prose-invert mx-auto">
                            <span className="text-primary font-bold tracking-widest uppercase text-xs block mb-6 text-center">The Philosophy</span>
                            <h3 className="text-4xl md:text-5xl font-bold font-georgia text-center mb-12 text-foreground">A Life That Fits</h3>

                            <p className="font-georgia leading-relaxed text-muted-foreground first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left">
                                We spend our lives waiting for the great day. We&apos;re taught that we are projects to be finished—that if we just pushed a little harder, worked a little longer, or fixed ourselves a little more, we&apos;d finally be &ldquo;enough.&rdquo; But the gap between who you are and who you think you should be never closes. It&rsquo;s not a problem to solve; it&apos;s a trick to see through. True change doesn&apos;t come from fighting yourself. It starts with a period at the end of the sentence. A full stop. An acceptance of *what is* as the only place where life actually happens.
                            </p>
                        </div>
                    </Reveal>

                    {/* Comfort */}
                    <Reveal>
                        <div className="grid md:grid-cols-[1fr_15rem] gap-8 items-center">
                            <div className="border-l-2 border-primary/20 pl-8 md:pl-12 py-2">
                                <p className="text-xl md:text-2xl font-georgia text-foreground italic leading-relaxed">
                                    &ldquo;Creating genuine conditions of comfort is an achievement, not a sign of laziness.&rdquo;
                                </p>
                                <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                                    Our culture treats rest as suspicious—something you have to earn by exhausting yourself first. But the Danes know better. They built an entire concept, *hygge*, around the radical idea that comfort is a skill. It&rsquo;s the ability to settle your nervous system, to find the deep exhale that proves you&apos;ve actually arrived. You don&apos;t have to earn the right to be warm.
                                </p>
                            </div>
                            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-md hidden md:block">
                                <Image
                                    src="/images/principles/comfort.png"
                                    alt="Wrapped in a blanket with a warm mug, morning light through the window"
                                    fill
                                    sizes="15rem"
                                    className="object-cover brightness-[0.97]"
                                />
                            </div>
                        </div>
                    </Reveal>

                    {/* Quality / Status */}
                    <Reveal>
                        <div className="prose prose-lg dark:prose-invert mx-auto">
                            <h4 className="font-georgia text-2xl font-bold mb-4 text-foreground">Stepping Off the Treadmill</h4>
                            <p className="text-muted-foreground leading-relaxed">
                                We run on a hedonic treadmill, chasing titles and purchases that promise happiness but only deliver a temporary spike before we adapt and want more. We post the highlight reel while hiding the reality. But a good Tuesday is worth more than a good title. When you stop measuring your life by how it looks to others and start measuring it by how it feels to you—choosing quality over status—you reclaim your autonomy. You build a life that fits, rather than one that just performs.
                            </p>
                        </div>
                    </Reveal>

                    {/* Speed / Slow */}
                    <Reveal>
                        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 items-center">
                            <div className="h-px bg-border w-full md:block hidden"></div>
                            <div className="text-center font-georgia italic text-2xl text-primary">The Speed of Life</div>
                            <div className="h-px bg-border w-full md:block hidden"></div>
                        </div>
                    </Reveal>

                    <Reveal>
                        <div className="relative aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-md mb-12">
                            <Image
                                src="/images/principles/slow.png"
                                alt="Pausing to rest a hand on an old mossy tree in a quiet, foggy forest"
                                fill
                                sizes="(max-width: 768px) 100vw, 48rem"
                                className="object-cover brightness-[0.95]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/15" />
                        </div>
                        <div className="prose prose-lg dark:prose-invert mx-auto">
                            <p className="text-muted-foreground leading-relaxed">
                                We are time-poor not because we lack hours, but because we rush through the ones we have. We swallow meals without tasting them and have conversations while mentally dragging ourselves to the next task. But presence has a speed limit. The &ldquo;Slow Movement&rdquo; isn&apos;t about being slow—it&apos;s about being intentional. It&apos;s about recognizing that you can&apos;t efficiency-hack joy, and that a single hour lived fully is worth more than a week lived in a blur.
                            </p>
                        </div>
                    </Reveal>

                    {/* Balance */}
                    <Reveal>
                        <div className="rounded-[2.5rem] bg-secondary/15 backdrop-blur-md p-8 md:p-12 shadow-sm border border-border/40">
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                <strong className="text-foreground block mb-2 font-georgia text-xl">You are a battery, not a machine.</strong>
                                Burnout isn&apos;t a badge of honor; it&apos;s a sign of debt. We treat our energy like an infinite resource, but it requires sustainable renewal. The most effective people aren&apos;t the ones who sprint until they crash—they&apos;re the ones who honor their own rhythms, who understand that rest is a prerequisite for contribution, not a reward for it.
                            </p>
                        </div>
                    </Reveal>

                    {/* Community */}
                    <Reveal>
                        <div className="grid md:grid-cols-[15rem_1fr] gap-8 items-center">
                            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-md hidden md:block">
                                <Image
                                    src="/images/principles/community.png"
                                    alt="Friends gathered together, present with one another"
                                    fill
                                    sizes="15rem"
                                    className="object-cover brightness-[0.97]"
                                />
                            </div>
                            <div className="prose prose-lg dark:prose-invert mx-auto">
                                <h4 className="font-georgia text-2xl font-bold mb-4 text-foreground">The Myth of the Self-Made</h4>
                                <p className="text-muted-foreground leading-relaxed">
                                    In a digital age that promised connection, we find ourselves in a loneliness epidemic. We&apos;ve bought into the myth that we should be able to do it all alone. But humans are pack animals. We need &ldquo;Third Places&rdquo; where we can just be. We need to move from transaction to gift, from competition to community. Because ultimately, we cannot &ldquo;just be&rdquo; in isolation. We need others to reflect our humanity back to us.
                                </p>
                            </div>
                        </div>
                    </Reveal>

                    {/* Gratitude */}
                    <Reveal>
                        <div className="text-center max-w-2xl mx-auto pt-12">
                            <div className="relative w-48 h-48 mx-auto mb-10 rounded-full overflow-hidden shadow-md">
                                <Image
                                    src="/images/principles/gratitude.png"
                                    alt="A lit candle and a warm coffee on a bedside table"
                                    fill
                                    sizes="12rem"
                                    className="object-cover brightness-[0.97]"
                                />
                            </div>
                            <div className="w-16 h-1 bg-primary mx-auto mb-8 rounded-full"></div>
                            <h4 className="font-georgia text-3xl font-bold mb-6 text-foreground">The Ordinary Miraculous</h4>
                            <p className="text-xl text-muted-foreground leading-relaxed font-light">
                                Finally, we learn that the extraordinary is hiding in the ordinary. The happiness we&apos;re chasing isn&apos;t over the next hill—it&apos;s in the coffee cup in your hand, the light in the window, the friend who calls. Gratitude isn&apos;t just a nice feeling; it&apos;s a way of seeing. It&apos;s the practice that turns what we have into enough.
                            </p>
                            <p className="text-2xl text-primary font-georgia font-bold mt-12 italic">
                                Just be.
                            </p>
                        </div>
                    </Reveal>

                    <NewsletterSignup />

                </div>
            </section>

            {/* Final CTA — same words, quieter voice */}
            <section className="w-full py-24 px-6">
                <Reveal className="relative max-w-3xl mx-auto">
                    <Halo />
                    <div className="relative rounded-[3rem] bg-background/70 backdrop-blur-xl border border-border/50 shadow-sm p-12 md:p-16 text-center">
                        <h2 className="text-4xl md:text-5xl font-bold font-georgia mb-6 text-foreground">Don&apos;t Just Optimize. Live.</h2>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                            The world is spinning faster. Algorithms are getting smarter. But your humanity is your superpower.
                        </p>
                        <a
                            href={AMAZON_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-10 py-5 bg-primary text-primary-foreground text-xl rounded-full font-bold shadow-xl hover:bg-primary/90 hover:shadow-2xl transform hover:-translate-y-1 transition-all text-center"
                        >
                            Get the Book
                        </a>
                        <p className="mt-6 text-[10px] text-muted-foreground italic">
                            As an Amazon Associate I earn from qualifying purchases.
                        </p>
                    </div>
                </Reveal>
            </section>

        </main>
    );
}
