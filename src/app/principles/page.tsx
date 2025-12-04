'use client';

import { motion } from 'framer-motion';

const principles = [
    {
        number: 1,
        title: "Acceptance, Not Settling",
        content: [
            "Accepting yourself isn't about chasing other people's approval—it's about getting comfortable with who you really are. When you embrace your true self—strengths, flaws, dreams and all—that's when you start to find real peace. This isn't giving up; it's actually freeing yourself to grow in ways that make sense for you, not following someone else's blueprint.",
            "Choosing acceptance over settling means building a life that feels right to you, based on what matters most to you—not just lowering your standards because you're tired of trying. When you stop constantly measuring yourself against others or chasing some perfect version of yourself that doesn't exist, you make space for something better: genuine satisfaction and a sense of being at home in your own life."
        ]
    },
    {
        number: 2,
        title: "Comfort as Achievement",
        content: [
            "In a world that's always pushing us to do more and be more, finding success through comfort feels almost rebellious. Being comfortable isn't being lazy—it's deliberately choosing peace of mind over constant hustle. It's about creating those moments and spaces where you can truly exhale, knowing these quiet times actually make your life better, not worse.",
            "Finding achievement in comfort means enjoying the small good things without feeling guilty—whether that's savoring a hot drink in your favorite chair or spending an evening wrapped in blankets doing absolutely nothing productive. These simple moments of relief aren't just nice to have—they're actually essential milestones on the path to feeling genuinely fulfilled and well in your own life."
        ]
    },
    {
        number: 3,
        title: "Quality Over Status",
        content: [
            "Choosing quality over status means caring more about what truly matters than what looks good to others. It's about pursuing experiences that actually feed your soul and build real relationships instead of chasing fancy titles or collecting things just to impress people.",
            "When you prioritize quality, you spend your energy on genuine connections and conversations that actually mean something. This approach leads to a deeper kind of satisfaction—one that comes from enjoying life's real treasures: those moments that genuinely enrich your journey, regardless of whether anyone else is impressed or even notices."
        ]
    },
    {
        number: 4,
        title: "Slow Down Intentionally",
        content: [
            "Life gets better when you deliberately slow down and step off the productivity treadmill. Taking your time helps you actually be present instead of constantly rushing through your days without really experiencing them.",
            "Slowing down means making space for quiet moments and breaks in your everyday routine. It's about pausing to notice the little things that usually just blur past. When you embrace a slower pace, you not only enjoy life more, but you also feel less stressed, think more clearly, and rediscover why you're doing all this in the first place."
        ]
    },
    {
        number: 5,
        title: "Balance Over Burnout",
        content: [
            "Balance is key to lasting happiness and growth. It means chasing your dreams without running yourself into the ground. It's about knowing when to push forward and when to back off, making sure your mental, emotional, and physical well-being don't get sacrificed along the way.",
            "Finding the sweet spot between ambition and rest prevents burnout and creates a sustainable rhythm for your life. It encourages setting gentler, more realistic goals that add to your life instead of draining you. When you live with balance, you make steady progress that actually feels good, leading to deeper, lasting contentment."
        ]
    },
    {
        number: 6,
        title: "Community, Not Competition",
        content: [
            "Community means building real connections based on supporting each other rather than trying to one-up everyone. It's about letting go of the need to win and instead creating genuine relationships that lift everyone involved.",
            "When you focus on community, you create spaces where people work together, show compassion, and give freely. This helps not just you, but everyone around you grow. True community adds richness to your life, giving you a sense of belonging and lasting fulfillment that you just can't get from going it alone."
        ]
    },
    {
        number: 7,
        title: "Gratitude and Small Joys",
        content: [
            "Gratitude and joy in everyday simplicity can transform ordinary moments into extraordinary experiences. Practicing gratitude daily helps you recognize and appreciate the abundance already present in your life, shifting your perspective towards contentment and fulfillment.",
            "Celebrating small joys—such as a warm drink, fresh linens, the scent of candles, or moments of quiet peacefulness—reinforces the beauty in life's simplicity. Regularly acknowledging these moments builds a foundation of sustained happiness and emotional resilience, anchoring your life in meaningful appreciation."
        ]
    }
];

export default function PrinciplesPage() {
    return (
        <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold font-dynapuff mb-6 text-primary">
                        The 7 Principles
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Guiding values for a life of intention, comfort, and genuine connection.
                    </p>
                </motion.div>

                <div className="space-y-12">
                    {principles.map((principle, index) => (
                        <motion.div
                            key={principle.number}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-dynapuff text-2xl md:text-3xl font-bold">
                                        {principle.number}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl md:text-3xl font-bold mb-4 font-dynapuff text-foreground">
                                        {principle.title}
                                    </h2>
                                    <div className="space-y-4 text-muted-foreground leading-relaxed text-lg">
                                        {principle.content.map((paragraph, pIndex) => (
                                            <p key={pIndex}>{paragraph}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="mt-20 text-center"
                >
                    <p className="text-2xl font-dynapuff text-primary/80">
                        Just be.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
