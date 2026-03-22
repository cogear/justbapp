import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const phantomPersonas = [
    {
        name: "Maya Chen",
        email: "maya.chen@theblife.com",
        personality: "Former tech startup founder who burned out at 32. Now a yoga instructor in Portland. Passionate about digital minimalism and finding presence in everyday moments. Writes thoughtfully about leaving hustle culture. Warm and self-deprecating."
    },
    {
        name: "James Okafor",
        email: "james.okafor@theblife.com",
        personality: "High school English teacher and weekend woodworker. Believes deeply in community and slow craft. Shares observations about teaching teenagers to slow down in an accelerated world. Gentle humor, loves quoting poetry."
    },
    {
        name: "Sari Patel",
        email: "sari.patel@theblife.com",
        personality: "Retired nurse, grandmother of four. Took up watercolor painting at 65. Champions the idea that rest is not laziness. Shares wisdom about aging gracefully and finding joy in small daily rituals. Direct but kind."
    },
    {
        name: "Eli Brooks",
        email: "eli.brooks@theblife.com",
        personality: "Late-20s landscape photographer who lives in a converted van. Explores the tension between ambition and contentment. Posts about nature, solitude, and what 'enough' means for a generation raised on social media comparison. Introspective, occasionally vulnerable."
    },
    {
        name: "Rosa Medina",
        email: "rosa.medina@theblife.com",
        personality: "Community garden organizer and part-time librarian. Single mom who found her way to intentional living through necessity, not privilege. Keeps it real about the challenges of slowing down when life demands speed. Funny, grounded, zero-BS."
    }
];

const defaultSpaces = [
    { name: "General", slug: "general", description: "Open discussion about intentional living and the b. life", type: "FEED" as const },
    { name: "Introductions", slug: "introductions", description: "Say hello and share what brought you here", type: "FEED" as const },
    { name: "Just Be Foundations", slug: "foundations", description: "A guided course through the 7 principles of The b. Life", type: "COURSE" as const },
];

const seedPosts: { spaceSlug: string; authorEmail: string; content: string }[] = [
    {
        spaceSlug: "general",
        authorEmail: "maya.chen@theblife.com",
        content: "I deleted all social media from my phone last month. The first week was brutal — I kept reaching for it like a phantom limb. But now? I notice things. The way light moves across my kitchen floor in the morning. The sound of rain that I used to scroll through. Presence isn't something you find. It's what's left when you stop running from silence."
    },
    {
        spaceSlug: "general",
        authorEmail: "james.okafor@theblife.com",
        content: "One of my students told me today that she feels guilty when she's not being productive. She's 16. I told her about the Japanese concept of 'ma' — the space between things that gives them meaning. A rest between notes isn't silence. It's music. I think she needed to hear that. Honestly, I needed to say it."
    },
    {
        spaceSlug: "general",
        authorEmail: "sari.patel@theblife.com",
        content: "I spent 40 years on my feet as a nurse, always moving, always needed. When I retired, people asked what I was going to DO. As if sitting with my tea and watching the birds wasn't doing something. Rest isn't the absence of purpose. Sometimes it IS the purpose."
    },
    {
        spaceSlug: "general",
        authorEmail: "rosa.medina@theblife.com",
        content: "Real talk: intentional living is easier when you have margin. When you're a single mom working two library shifts, 'slow down' can feel like advice from another planet. But I've found my version of it — growing tomatoes with my kids, reading one poem before bed, saying no to one thing a week. It's not perfect. It's mine."
    },
    {
        spaceSlug: "introductions",
        authorEmail: "eli.brooks@theblife.com",
        content: "Hey everyone — I'm Eli. I live in a van and take photos of landscapes most people will never see in person. I came to The b. Life because I was chasing sunsets but never actually watching them. Always behind the lens, never in the moment. Trying to change that. Glad to be here."
    },
    {
        spaceSlug: "introductions",
        authorEmail: "maya.chen@theblife.com",
        content: "Hi! I'm Maya. I used to run a startup where 'crushing it' was the only acceptable state of being. I crushed myself instead. Now I teach yoga and try to practice what I preach about being present. This community feels like the kind of place where you can just... be. Looking forward to connecting."
    },
    {
        spaceSlug: "introductions",
        authorEmail: "james.okafor@theblife.com",
        content: "Hello, friends. I'm James — I teach English and make furniture on weekends. Both require patience, which I'm still learning. A student recommended this book to me (yes, I take reading recommendations from teenagers) and it resonated deeply. Excited to be part of this community."
    },
];

async function main() {
    console.log("🌱 Seeding community data...\n");

    // 1. Seed phantom users
    console.log("👤 Creating phantom users...");
    const users: Record<string, string> = {};
    for (const persona of phantomPersonas) {
        const existing = await prisma.user.findUnique({ where: { email: persona.email } });
        if (existing) {
            console.log(`  ↳ ${persona.name} already exists`);
            users[persona.email] = existing.id;
        } else {
            const user = await prisma.user.create({
                data: {
                    email: persona.email,
                    displayName: persona.name,
                    isPhantom: true,
                    psychographicProfile: persona.personality,
                }
            });
            console.log(`  ✓ Created ${persona.name}`);
            users[persona.email] = user.id;
        }
    }

    // 2. Seed spaces
    console.log("\n📂 Creating spaces...");
    const spaces: Record<string, string> = {};
    for (const space of defaultSpaces) {
        const existing = await prisma.space.findUnique({ where: { slug: space.slug } });
        if (existing) {
            console.log(`  ↳ ${space.name} already exists`);
            spaces[space.slug] = existing.id;
        } else {
            const created = await prisma.space.create({
                data: {
                    name: space.name,
                    slug: space.slug,
                    description: space.description,
                    type: space.type,
                }
            });
            console.log(`  ✓ Created ${space.name}`);
            spaces[space.slug] = created.id;
        }
    }

    // 3. Seed posts
    console.log("\n📝 Creating seed posts...");
    for (const post of seedPosts) {
        const spaceId = spaces[post.spaceSlug];
        const authorId = users[post.authorEmail];

        if (!spaceId || !authorId) {
            console.log(`  ✗ Skipping post — missing space or author`);
            continue;
        }

        // Ensure author is a member of the space
        const membership = await prisma.spaceMember.findFirst({
            where: { spaceId, userId: authorId }
        });
        if (!membership) {
            await prisma.spaceMember.create({
                data: { spaceId, userId: authorId, role: 'MEMBER' }
            });
        }

        await prisma.post.create({
            data: {
                content: post.content,
                spaceId,
                authorId,
            }
        });
        const authorName = phantomPersonas.find(p => p.email === post.authorEmail)?.name;
        console.log(`  ✓ Post by ${authorName} in #${post.spaceSlug}`);
    }

    console.log("\n✅ Community seeding complete!");
}

main()
    .catch((e) => {
        console.error("Seed failed:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
