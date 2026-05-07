export type CourseLandingContent = {
    heroSubtitle?: string;
    heroImage?: { src: string; alt: string };
    intro: {
        paragraphs: string[];
    };
    moduleOverviews?: Record<number, string>;
    moduleImages?: Record<number, { src: string; alt: string }>;
};

export const courseLandingContent: Record<string, CourseLandingContent> = {
    'ai-for-humans': {
        heroSubtitle: 'A human-centered guide to understanding and working with AI.',
        heroImage: { src: '/images/hero-community.jpg', alt: 'A community gathered, present together' },
        intro: {
            paragraphs: [
                'AI is no longer on the horizon. It is already shaping how we write, how we learn, how we parent, how we work, and how we make sense of the news. Most of us never chose a moment to sit down and learn what this thing actually is, or how to talk to it without feeling awkward about it.',
                'This course is that moment. No technical background required. No jargon to memorize. Just plain language, real examples, and the quiet confidence that comes from understanding the tool in your hands instead of being a little bit afraid of it.',
                'The goal is not to turn you into an engineer. The goal is to help you stay yourself while the world around you changes. To use AI the way you might use any good tool: clearly, intentionally, and without losing the parts of your thinking that make you you.',
            ],
        },
        moduleOverviews: {
            1: 'Three lessons to start with. What a large language model actually is, how to talk to one without feeling awkward, and how to use it as a thinking partner instead of a search engine. If you only read one module first, read this one.',
            2: 'The quiet foundations of how AI actually works, explained in plain language. How it "learns" from patterns, why it sometimes makes things up with confidence, why it forgets between conversations, and why it reflects us more than we realize.',
            3: 'The small habits that turn AI from a novelty into something genuinely useful. Being specific, showing instead of telling, disagreeing when it is wrong, and treating the conversation as a thinking partnership rather than a query to an oracle.',
            4: 'The ordinary, unglamorous ways AI can make a day lighter. Planning a trip without the overwhelm, writing the email you could not start, adapting a recipe to what is actually in your fridge, thinking through a decision out loud.',
            5: 'Creativity is already yours. This module is about the moments where AI can help you past a blank page, past your own self-editing, past the fear of sharing early drafts — without replacing the voice that makes the work worth making.',
            6: 'Learning, unhurried. How to use AI as a patient tutor who never judges, explains things the way you need them explained, and stays with you until the concept actually clicks. No shame, no speed test, no one watching.',
            7: 'Working smarter without losing yourself in the work. How to prep for hard meetings, translate corporate jargon, draft faster without sounding like a robot, see your own blind spots, and build systems instead of grinding through tasks.',
            8: 'The words we struggle to find for the people who matter most. How to write an apology you mean, set a boundary kindly, finally send the thank-you note, or start the conversation you have been putting off for months.',
            9: 'Quiet uses of AI for the inner life. Thinking out loud safely, naming what you feel, noticing the pattern in your thoughts, and finding a little more compassion for yourself on the days that do not go well.',
            10: 'The honest questions worth sitting with. Who benefits from this technology, what biases it inherits from us, where to trust it, where to verify, and where the line sits between help and replacement — especially for the work and the people we care about.',
            11: 'Less about the tool, more about us. How to stay human in an AI world, which skills matter more now and which matter less, the slow approach, and what kind of relationship with technology you actually want to keep.',
            12: 'The technical words you will hear in conversation, explained in plain language. Tokens, temperature, context windows, fine-tuning, agents — enough to follow along at dinner, never so much that you need a computer science degree.',
        },
        moduleImages: {
            1: { src: '/images/archetypes/explorer.png', alt: 'Starting out, curious' },
            2: { src: '/images/archetypes/methodical.png', alt: 'Understanding the foundations' },
            3: { src: '/images/archetypes/reserved.png', alt: 'Working with intention' },
            4: { src: '/images/archetypes/balanced.png', alt: 'AI woven into daily life' },
            5: { src: '/images/reflection.png', alt: 'Creative reflection' },
            6: { src: '/images/archetypes/role-model.png', alt: 'Learning with a patient guide' },
            7: { src: '/images/archetypes/methodical.png', alt: 'Structured, thoughtful work' },
            8: { src: '/images/connection.png', alt: 'Honest connection in words' },
            9: { src: '/images/principles/acceptance.png', alt: 'Quiet space for the inner life' },
            10: { src: '/images/archetypes/ego-resilient.png', alt: 'Thinking honestly about hard questions' },
            11: { src: '/images/hero-community.jpg', alt: 'Staying human in an AI world' },
            12: { src: '/images/archetypes/explorer.png', alt: 'The technical language, made human' },
        },
    },
    'living-with-ai': {
        heroSubtitle: 'Intentional living in an AI-forward world.',
        heroImage: { src: '/images/living-with-ai-hero.jpg', alt: 'A couple walking together in autumn light' },
        intro: {
            paragraphs: [
                'The pace of the world is changing faster than our nervous systems were built for. Every day brings a new tool, a new pressure to optimize, a new reason to feel behind. It is easy, in a moment like this, to hand over the parts of life that were never meant to be outsourced.',
                'This course is a slower kind of conversation. It is not about rejecting AI, and it is not about chasing it either. It is about staying rooted. Staying human. Choosing acceptance over striving, quality over status, community over competition, and small joys over another item on the list.',
                'If you have felt the low hum of "more, faster, better" and wondered what the alternative is, this is the alternative. Seven principles from The b. Life, written for the world we actually live in now.',
            ],
        },
        moduleOverviews: {
            1: 'One lesson to start: the voice inside your head that never stops telling you you are behind. Where it comes from, why it sounds so much like you, and why it might not be telling the truth.',
            2: 'The first b. Life principle. The difference between accepting where you are and giving up on growing — and how much of daily unhappiness comes from quietly refusing to meet your life as it actually is, right now.',
            3: 'Comfort is not the enemy of an ambitious life. In a culture that treats rest as lazy and ease as suspicious, this module makes the quiet case that comfort itself is an achievement worth protecting, not a reward you have to earn.',
            4: 'Most of what we chase is for the audience, not ourselves. The practice of quietly trading status for quality — the dinner no one will see, the five real friendships, the Tuesday that was genuinely good even though no one posted about it.',
            5: 'Slowness as a choice, not a failure. Why "busy" became a status symbol, how time famine makes everything feel urgent, and a few small rituals for taking your life at something closer to human pace.',
            6: 'The kind of tired that sleep does not fix is the kind we are mostly talking about. A clearer look at where your energy actually goes, what truly refills it, and the boundaries that turn burnout from a recurring event into something you can step away from.',
            7: 'The loneliness of modern life is not your fault, and it is not fixed by more self-improvement. This module is about the quieter practice of belonging — third places, gift economies, real friends, and showing up before you feel ready.',
            8: 'Not the performative kind. The real kind — which starts by noticing what is already here and slowing down long enough to actually feel it, instead of chasing the next arrival that was supposed to finally be enough.',
        },
        moduleImages: {
            1: { src: '/images/reflection.png', alt: 'The voice that never stops' },
            2: { src: '/images/principles/acceptance.png', alt: 'Acceptance, not settling' },
            3: { src: '/images/principles/comfort.png', alt: 'Comfort as achievement' },
            4: { src: '/images/principles/quality.png', alt: 'Quality over status' },
            5: { src: '/images/principles/slow.png', alt: 'Slowing down intentionally' },
            6: { src: '/images/principles/balance.png', alt: 'Balance over burnout' },
            7: { src: '/images/principles/community.png', alt: 'Community, not competition' },
            8: { src: '/images/principles/gratitude.png', alt: 'Gratitude and small joys' },
        },
    },
};
