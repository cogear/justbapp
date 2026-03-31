import prisma from '../prisma.js';
import { principles } from '../data/book-content.js';
import { phantomPersonas } from '../data/phantom-personas.js';

export async function generateWellnessPost(args: { principle_number?: number }) {
    let principle;
    if (args.principle_number && args.principle_number >= 1 && args.principle_number <= 7) {
        principle = principles[args.principle_number - 1];
    } else {
        principle = principles[Math.floor(Math.random() * principles.length)];
    }

    // Pick a random phantom persona as suggested author
    const persona = phantomPersonas[Math.floor(Math.random() * phantomPersonas.length)];

    return {
        principle_number: principle.number,
        principle_title: principle.title,
        content: principle.content.join('\n\n'),
        quotes: principle.quotes,
        suggested_author: {
            name: persona.name,
            email: persona.email,
            personality: persona.personality,
        },
        suggested_space: "general",
        prompt: `Write a warm, grounded community post inspired by the b. Life principle "${principle.title}".

The post should be written from the perspective of ${persona.name}: ${persona.personality}

Draw from these ideas:
${principle.content.join('\n\n')}

Key quotes to consider weaving in naturally:
${principle.quotes.map(q => `- "${q}"`).join('\n')}

Guidelines:
- Keep it conversational and authentic to this person's voice
- 2-3 paragraphs max
- End with a question to spark discussion
- Don't be preachy — share a personal moment or observation
- Use the brand voice: warm, grounded, honest, gently rebellious, unhurried`
    };
}

export async function generateAiNewsPost() {
    const articles = await prisma.newsArticle.findMany({
        take: 5,
        orderBy: { publishedAt: 'desc' },
        select: {
            id: true,
            title: true,
            description: true,
            source: true,
            publishedAt: true,
        }
    });

    if (articles.length === 0) {
        return {
            success: false,
            message: "No news articles found in the database. Run news ingestion first.",
        };
    }

    const persona = phantomPersonas[Math.floor(Math.random() * phantomPersonas.length)];

    return {
        articles: articles.map(a => ({
            title: a.title,
            description: a.description,
            source: a.source,
            publishedAt: a.publishedAt,
        })),
        suggested_author: {
            name: persona.name,
            email: persona.email,
            personality: persona.personality,
        },
        suggested_space: "general",
        prompt: `Write a discussion post for the Just Be community about recent AI developments, from the perspective of ${persona.name}: ${persona.personality}

Recent AI news:
${articles.map(a => `- "${a.title}" (${a.source}): ${a.description || 'No description'}`).join('\n')}

Guidelines:
- Frame it through the lens of how AI affects human wellbeing, connection, and intentional living
- Connect to the b. Life philosophy — what AI can't replace is our humanity
- Keep the tone warm but thoughtful, not alarmist
- 2-3 paragraphs
- End with a question to spark discussion
- Write in this person's authentic voice`
    };
}
