'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const principles = [
    {
        number: 1,
        title: "Acceptance, Not Settling",
        image: "/images/principles/acceptance.png",
        content: [
            "Accepting yourself isn't about chasing other people's approval—it's about getting comfortable with who you really are. When you embrace your true self—strengths, flaws, dreams and all—that's when you start to find real peace. This isn't giving up; it's actually freeing yourself to grow in ways that make sense for you, not following someone else's blueprint.",
            "Choosing acceptance over settling means building a life that feels right to you, based on what matters most to you—not just lowering your standards because you're tired of trying. When you stop constantly measuring yourself against others or chasing some perfect version of yourself that doesn't exist, you make space for something better: genuine satisfaction and a sense of being at home in your own life."
        ]
    },
    {
        number: 2,
        title: "Comfort as Achievement",
        image: "/images/principles/comfort.png",
        content: [
            "In a world that's always pushing us to do more and be more, finding success through comfort feels almost rebellious. Being comfortable isn't being lazy—it's deliberately choosing peace of mind over constant hustle. It's about creating those moments and spaces where you can truly exhale, knowing these quiet times actually make your life better, not worse.",
            "Finding achievement in comfort means enjoying the small good things without feeling guilty—whether that's savoring a hot drink in your favorite chair or spending an evening wrapped in blankets doing absolutely nothing productive. These simple moments of relief aren't just nice to have—they're actually essential milestones on the path to feeling genuinely fulfilled and well in your own life."
        ]
    },
    {
        number: 3,
        title: "Quality Over Status",
        image: "/images/principles/quality.png",
        content: [
            "Choosing quality over status means caring more about what truly matters than what looks good to others. It's about pursuing experiences that actually feed your soul and build real relationships instead of chasing fancy titles or collecting things just to impress people.",
            "When you prioritize quality, you spend your energy on genuine connections and conversations that actually mean something. This approach leads to a deeper kind of satisfaction—one that comes from enjoying life's real treasures: those moments that genuinely enrich your journey, regardless of whether anyone else is impressed or even notices."
        ]
    },
    {
        number: 4,
        title: "Slow Down Intentionally",
        image: "/images/principles/slow.png",
        content: [
            "Life gets better when you deliberately slow down and step off the productivity treadmill. Taking your time helps you actually be present instead of constantly rushing through your days without really experiencing them.",
            "Slowing down means making space for quiet moments and breaks in your everyday routine. It's about pausing to notice the little things that usually just blur past. When you embrace a slower pace, you not only enjoy life more, but you also feel less stressed, think more clearly, and rediscover why you're doing all this in the first place."
        ]
    },
    {
        number: 5,
        title: "Balance Over Burnout",
        image: "/images/principles/balance.png",
        content: [
            "Balance is key to lasting happiness and growth. It means chasing your dreams without running yourself into the ground. It's about knowing when to push forward and when to back off, making sure your mental, emotional, and physical well-being don't get sacrificed along the way.",
            "Finding the sweet spot between ambition and rest prevents burnout and creates a sustainable rhythm for your life. It encourages setting gentler, more realistic goals that add to your life instead of draining you. When you live with balance, you make steady progress that actually feels good, leading to deeper, lasting contentment."
        ]
    },
    {
        number: 6,
        title: "Community, Not Competition",
        image: "/images/principles/community.png",
        content: [
            "Community means building real connections based on supporting each other rather than trying to one-up everyone. It's about letting go of the need to win and instead creating genuine relationships that lift everyone involved.",
            "When you focus on community, you create spaces where people work together, show compassion, and give freely. This helps not just you, but everyone around you grow. True community adds richness to your life, giving you a sense of belonging and lasting fulfillment that you just can't get from going it alone."
        ]
    },
    {
        number: 7,
        title: "Gratitude and Small Joys",
        image: "/images/principles/gratitude.png",
        content: [
            "Gratitude and joy in everyday simplicity can transform ordinary moments into extraordinary experiences. Practicing gratitude daily helps you recognize and appreciate the abundance already present in your life, shifting your perspective towards contentment and fulfillment.",
            "Celebrating small joys—such as a warm drink, fresh linens, the scent of candles, or moments of quiet peacefulness—reinforces the beauty in life's simplicity. Regularly acknowledging these moments builds a foundation of sustained happiness and emotional resilience, anchoring your life in meaningful appreciation."
        ]
    }
];

export default function PrinciplesPage() {
    return (
        <main className="min-h-screen bg-[#FDFCFB] dark:bg-[#0A0A0A] py-24 px-6 transition-colors duration-500">
            <div className="max-w-5xl mx-auto">
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-32 space-y-6"
                >
                    <h1 className="text-6xl md:text-8xl font-bold font-georgia text-primary tracking-tight">
                        The Principles
                    </h1>
                    <div className="h-1 w-24 bg-primary/20 mx-auto rounded-full" />
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-georgia italic font-light leading-relaxed">
                        Guiding values for a life of intention, comfort, and genuine connection.
                    </p>
                </motion.header>

                <div className="space-y-40">
                    {principles.map((principle, index) => (
                        <motion.section
                            key={principle.number}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 md:gap-24 items-center`}
                        >
                            <div className="w-full md:w-1/2 space-y-8">
                                <div className="space-y-4">
                                    <span className="text-primary/40 font-georgia text-5xl md:text-6xl block">
                                        0{principle.number}
                                    </span>
                                    <h2 className="text-3xl md:text-5xl font-bold font-georgia text-foreground leading-tight">
                                        {principle.title}
                                    </h2>
                                </div>
                                <div className="space-y-6 text-muted-foreground font-georgia leading-relaxed text-lg md:text-xl">
                                    {principle.content.map((paragraph, pIndex) => (
                                        <p key={pIndex}>{paragraph}</p>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full md:w-1/2">
                                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl group">
                                    <Image
                                        src={principle.image}
                                        alt={principle.title}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                </div>
                            </div>
                        </motion.section>
                    ))}
                </div>

                <motion.footer
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="mt-60 text-center space-y-12"
                >
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
                    <p className="text-4xl md:text-6xl font-georgia text-primary/80 italic font-light">
                        Just be.
                    </p>
                    <div className="pt-12">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.5em] font-light">
                            est. 2024
                        </p>
                    </div>
                </motion.footer>
            </div>
        </main>
    );
}
