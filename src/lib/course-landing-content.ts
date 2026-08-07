export type CourseLandingContent = {
    /** Short emotional headline for the hero (falls back to the course title). */
    heroHeadline?: string;
    heroSubtitle?: string;
    heroImage?: { src: string; alt: string };
    /** Three short value props about the lesson format, shown as chips under the hero. */
    formatPromise?: { title: string; body: string }[];
    /** Primary CTA label, links to the first module. */
    ctaLabel?: string;
    intro: {
        paragraphs: string[];
    };
    moduleOverviews?: Record<number, string>;
    moduleImages?: Record<number, { src: string; alt: string }>;
};

export const courseLandingContent: Record<string, CourseLandingContent> = {
    'ai-for-humans': {
        heroHeadline: 'You don’t need to become technical. You just need a good explanation.',
        heroSubtitle:
            'Short, story-driven videos and essays that explain AI in plain language — what it actually is, how to talk to it, and how to fold it into a life that still feels like yours.',
        formatPromise: [
            {
                title: 'Told as stories',
                body: 'Every lesson starts with a person and a moment — not a diagram. You remember it because it felt like something.',
            },
            {
                title: 'Plain language, always',
                body: 'No jargon, no prerequisites, no homework. If a term matters, we explain it the way a friend would over coffee.',
            },
            {
                title: 'Minutes, not semesters',
                body: 'Each lesson is a few unhurried minutes. One with your morning coffee is the whole curriculum for today.',
            },
        ],
        ctaLabel: 'Begin with the first story',
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
        heroHeadline: 'A slower way to live in a faster world.',
        heroSubtitle:
            'Seven b. life principles, told through short videos and quiet essays — not about rejecting AI, and not about chasing it. About staying rooted.',
        formatPromise: [
            {
                title: 'Gentle, not preachy',
                body: 'These are conversations, not lectures. Take what helps, leave the rest.',
            },
            {
                title: 'Written for real weeks',
                body: 'Small practices that fit inside an ordinary Tuesday, not a retreat schedule.',
            },
            {
                title: 'A few minutes at a time',
                body: 'Each lesson is short on purpose. Slowness is the point.',
            },
        ],
        ctaLabel: 'Begin with module one',
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
    'the-quiet-crafts': {
        heroHeadline: 'Your hands already know how to calm you.',
        heroSubtitle:
            'Knitting, mending, folding, tending, kneading, repairing — the quiet practices that settle a loud mind. Not hobbies, not productivity. Just work your body knows how to do.',
        ctaLabel: 'Begin with your hands',
        intro: {
            paragraphs: [
                'Watch anyone waiting for hard news and look at their hands. A pen turned over, a ring pushed around a finger, a napkin folded smaller and smaller. When the mind gets loud, the body reaches for something to hold. This course takes that instinct seriously.',
                'Each module is a different practice — yarn, thread, paper, plants, the kitchen, repair — taught plainly enough to start this week. Nothing here is a side hustle. Nothing needs to be good enough to sell, or even to show. The making is the point; the object is just what is left over afterward.',
            ],
        },
        moduleOverviews: {
            1: 'Three lessons to start: why handwork calms the nervous system, how to choose your first practice, and why the first hour is supposed to be bad.',
            2: 'The quiet science and older wisdom of why making settles us — repetition, flow, boredom, and the difference between rest and distraction.',
            3: 'Knitting from absolute zero: needles, yarn, the two stitches that make everything, and a first dishcloth that does not need to be good.',
            4: 'Crochet, one hook and one loop at a time — chains, rows, rounds, the granny square, and the blanket that takes a year on purpose.',
            5: 'Needle and thread: hems, buttons, visible mending, sashiko, and the mending basket that replaces the donation bag.',
            6: 'Paper as a calm material — folding, binding, collage, letters written by hand, and journaling that is not confession.',
            7: 'Growing things at any scale: one houseplant done well, windowsill herbs, propagation, seeds, patience, and failure.',
            8: 'The kitchen as practice — bread and the long rise, kneading, chopping, the simmer, tea as ceremony, and the dishes afterward.',
            9: 'Repair and restore: kintsugi, sharpening, bicycles, books, and what keeping a thing for thirty years teaches.',
            10: 'The closing argument: making things you will never sell, skill without ambition, and ten years of Tuesdays.',
        },
    },
    'third-places': {
        heroHeadline: 'Somewhere that is not home and not work.',
        heroSubtitle:
            'The counters, benches, libraries, and corner tables where nobody invited you, nobody owns you, and nobody minds when you leave. How to find one — and how to become a regular.',
        ctaLabel: 'Find your third place',
        intro: {
            paragraphs: [
                'Most of us run one loop: home, work, home. Two rooms and the road between them. The third room — the café counter, the library table, the bench by the courts — quietly disappeared from most lives, and we feel the missing air without knowing its name.',
                'This course is built on Ray Oldenburg\u2019s idea of the third place, and it keeps his defining rule strict: no host, no invitation, nothing owed. You walk in because the door is open. You become a regular by showing up. That is the whole application.',
            ],
        },
        moduleOverviews: {
            1: 'What a third place is, why yours went missing, and how to find one this week.',
            2: 'Oldenburg\u2019s eight characteristics — the doctrinal spine of the whole idea, from neutral ground to a home away from home.',
            3: 'How third places disappeared: cars, zoning, rent, television, and what the loneliness numbers actually say.',
            4: 'Cafés, counters and bars — finding a place with chairs that stay, ordering the same thing, sitting alone without a laptop.',
            5: 'Libraries and public rooms: the last free spaces, and how to use them like a regular.',
            6: 'Outdoors and open ground — parks, benches, dog parks, farmers markets, and the year-round weather problem.',
            7: 'Places built around doing: gyms, run clubs, barbershops, yarn shops, makerspaces — where the activity is the excuse.',
            8: 'Becoming a regular: frequency over intensity, calibrated small talk, weak ties, and reading a room\u2019s unwritten rules.',
            9: 'When there are not any — auditing your ten-minute radius, suburbs, night shifts, no-money options, and starting one where none exists.',
            10: 'The online question: what Discord gets right, what a screen cannot replace, and using online to find offline.',
        },
    },
    'private-invite-meetups': {
        heroHeadline: 'The gathering only happens if you make it.',
        heroSubtitle:
            'Dinner tables, Sunday walks, game nights, standing breakfasts — the gatherings someone has to author. Hosting as a learnable craft, with the obligation that makes it work.',
        ctaLabel: 'Start with one invitation',
        intro: {
            paragraphs: [
                'Every good night you have ever had with people you love was made by somebody. Somebody picked a date, sent a slightly awkward message, moved the laundry off the couch, and stayed up washing glasses. Left to itself, nothing gathers.',
                'This course treats hosting as a craft anyone can learn — not a personality type. Small over impressive, frequency over ambition, soup out of the pot it was cooked in. The house does not have to be clean. The invitation just has to be sent.',
            ],
        },
        moduleOverviews: {
            1: 'Three lessons to start: why gatherings need an author, why hosting feels harder than it is, and inviting three people this month.',
            2: 'Why host at all — what changes when there is a door, the obligation that makes it work, and the standing invitation.',
            3: 'The invitation itself: asking without pressure, specific over open-ended, who to invite, flakes, and following up without nagging.',
            4: 'Dinner parties without performance — one dish done well, the first fifteen minutes, and ending the night.',
            5: 'Walks and the outdoors: why walking makes talking easier, and gatherings for people who do not want anyone in their house.',
            6: 'Games and sport as social scaffolding — board game night, pickleball, backyard volleyball, and managing the competitive.',
            7: 'Small and low effort: coffee for two, the standing breakfast, reading in the same room, gatherings under an hour.',
            8: 'Hosting skills, properly taught — the threshold, introductions, rescuing the awkward middle, closing on time.',
            9: 'Reciprocity without scorekeeping: who hosts next, bringing something, money, and turning a gathering into a rhythm.',
            10: 'When it goes wrong — the party nobody came to, conflict at the table, and letting a gathering end for good.',
        },
    },
    'the-comfortable-life': {
        heroHeadline: 'Every culture solved comfort differently. Borrow the best of it.',
        heroSubtitle:
            'Hygge, koselig, gezelligheid, Gem\u00fctlichkeit, wabi-sabi and the wider map — a world tour of comfort traditions, turned into a practice for your own rooms. Even the hot ones.',
        ctaLabel: 'Begin the tour',
        intro: {
            paragraphs: [
                'You have had the feeling: one lamp on, someone you like nearby, nothing scheduled, nobody checking the time. English never gave that feeling a proper name — other languages did, and each name carries a small philosophy of how to build it on purpose.',
                'This course tours those traditions one at a time, takes what travels, and finishes somewhere most comfort writing never goes: a hot climate, where the evening is your winter and the screened porch is your hearth. Comfort here is a practice, not a purchase.',
            ],
        },
        moduleOverviews: {
            1: 'Three lessons to start: the words English does not have, comfort as achievement rather than indulgence, and one cozy hour this week.',
            2: 'Hygge — Denmark: candles, the corner that is yours, cake without apology, and reclaiming the word from the candle aisle.',
            3: 'Koselig — Norway: the outdoor cousin. No bad weather, only bad clothes; the winter walk and the warm return.',
            4: 'Gezelligheid — the Netherlands: comfort as conviviality. The brown caf\u00e9, borrel, and rooms that are social before they are soft.',
            5: 'Gem\u00fctlichkeit — Germany and Austria: the regulars\u2019 table, Kaffee und Kuchen, Feierabend, and why comfort needs boundaries.',
            6: 'Wabi-sabi and the Japanese room: the chipped cup, the golden seam, the space between things, and comfort as attention.',
            7: 'The wider map — cwtch, fika, lagom, sisu, keyif, sobremesa, dolce far niente, ubuntu. Every culture solved this differently.',
            8: 'Building your own: light, texture, the chair that is yours, warm food, the cup as ritual, and a personal comfort doctrine.',
            9: 'Comfort in a hard climate — written for Florida. Heat as the enemy of cozy, the evening as your winter, rainy season as hygge season.',
            10: 'Defending your comfort: hustle culture, consumerism, the difference between cozy and numb, and a comfortable life on purpose.',
        },
    },
};
