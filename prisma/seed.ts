import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    // 1. General Feed
    const general = await prisma.space.upsert({
        where: { slug: 'general' },
        update: {},
        create: {
            name: 'General',
            slug: 'general',
            description: 'The main community feed.',
            type: 'FEED',
        },
    })

    // 2. Introductions Feed
    const introductions = await prisma.space.upsert({
        where: { slug: 'introductions' },
        update: {},
        create: {
            name: 'Introductions',
            slug: 'introductions',
            description: 'Say hello to the community!',
            type: 'FEED',
        },
    })

    // 3. Foundations Course
    const foundations = await prisma.space.upsert({
        where: { slug: 'foundations' },
        update: {},
        create: {
            name: 'Just Be Foundations',
            slug: 'foundations',
            description: 'The core principles of Just Be.',
            type: 'COURSE',
        },
    })

    // Create a course record if it doesn't exist
    if (foundations.type === 'COURSE') {
        const course = await prisma.course.findFirst({
            where: { spaceId: foundations.id }
        });

        if (!course) {
            await prisma.course.create({
                data: {
                    spaceId: foundations.id,
                    title: 'Just Be Foundations',
                    description: 'Learn the basics.',
                    modules: {
                        create: [
                            {
                                title: 'Module 1: The Beginning',
                                order: 1,
                                lessons: {
                                    create: [
                                        { title: 'Welcome', order: 1, content: 'Welcome to the course' },
                                        { title: 'Philosophy', order: 2, content: 'Deep dive' }
                                    ]
                                }
                            }
                        ]
                    }
                }
            })
        }
    }

    console.log({ general, introductions, foundations })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
