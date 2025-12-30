import prisma from '@/lib/prisma';
import OpenAI from 'openai';

function getOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not set');
    }
    return new OpenAI({ apiKey });
}

export async function generateDailyEssence(date: Date = new Date(), cluster: string = "Global") {
    // Normalize date to start of day for querying
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch articles from the last 24 hours (or specific day)
    // We'll look at publishedAt
    const articles = await prisma.newsArticle.findMany({
        where: {
            publishedAt: {
                gte: startOfDay,
                lte: endOfDay
            }
        },
        select: {
            title: true,
            description: true
        }
    });

    if (articles.length === 0) {
        return null;
    }

    // Construct prompt
    const articleText = articles.map(a => `- ${a.title}: ${a.description || ''}`).join('\n');

    let clusterInstruction = "";
    if (cluster !== "Global") {
        clusterInstruction = `Tailor the summary for a "${cluster}" personality type. 
        - If "Explorer": Focus on curiosity, discovery, and new horizons.
        - If "Caregiver": Focus on empathy, community, and human connection.
        - If "Creator": Focus on innovation, expression, and cultural shifts.
        - If "Sage": Focus on wisdom, analysis, and deeper meaning.
        - If "Jester": Focus on the absurdity, lightness, or playfulness of the day.
        - If "Ruler": Focus on order, structure, and leadership.
        - If "Lover": Focus on passion, beauty, and relationships.
        - If "Hero": Focus on courage, overcoming challenges, and action.
        - If "Magician": Focus on transformation and vision.
        - If "Outlaw": Focus on disruption and challenging the status quo.
        - If "Everyman": Focus on relatability and the common experience.
        - If "Innocent": Focus on optimism and simplicity.
        `;
    }

    const prompt = `
    Analyze the following news headlines and descriptions from today.
    Summarize the **thematic drivers** and **collective mood** of the day.
    
    Instead of just abstract feelings, identify the *types* of events shaping the day (e.g., "Economic uncertainty," "Technological breakthroughs," "Political gridlock").
    You MAY allude to major event categories or sectors (e.g., "The tech sector," "Global markets," "Local governance").
    Do NOT explicitly reference specific proper nouns (names of people, specific companies, or specific city names) unless they are broadly thematic (e.g. "Wall Street").
    
    Goal: Create a "meaty" summary that tells the user *what kind of day* it is, not just how it feels.
    Keep it under 100 words.
    
    ${clusterInstruction}
    
    News Items:
    ${articleText}
    `;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "You are an insightful Sociological Analyst. Provide summaries in plain, clean prose. Do NOT use markdown formatting like bolding (**) or italics (*). Avoid lists. Focus on a fluid, narrative paragraph that is easy to read."
            },
            {
                role: "user",
                content: prompt
            }
        ]
    });

    const content = completion.choices[0].message.content || "No summary available.";

    // Determine mood (simple heuristic or separate LLM call, for now just null or extract if we wanted)
    // Let's try to extract a mood keyword if possible, but for now just content is fine.

    // Save to DB
    // We use upsert to ensure only one summary per day per cluster
    const summary = await prisma.dailySummary.upsert({
        where: {
            date_cluster: {
                date: startOfDay,
                cluster: cluster
            }
        },
        update: {
            content
        },
        create: {
            date: startOfDay,
            cluster: cluster,
            content
        }
    });

    return summary;
}

export async function generateAllDailySummaries(date: Date = new Date()) {
    const clusters = [
        "Global",
        "Explorer", "Caregiver", "Creator", "Sage", "Jester",
        "Ruler", "Lover", "Hero", "Magician", "Outlaw", "Everyman", "Innocent"
    ];

    const results = [];
    for (const cluster of clusters) {
        console.log(`Generating summary for ${cluster}...`);
        try {
            const summary = await generateDailyEssence(date, cluster);
            results.push(summary);
        } catch (error) {
            console.error(`Failed to generate summary for ${cluster}:`, error);
        }
    }
    return results;
}
