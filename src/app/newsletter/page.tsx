import React from 'react';
import { Metadata } from 'next';
import { format } from 'date-fns';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Play, Headset, Image as ImageIcon, Video, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
    title: 'b. | Newsletter',
    description: 'Daily insights, audio briefings, and guided reflections.',
};

function getS3Url(path: string) {
    return `https://justbblog.s3.amazonaws.com/${path}`;
}

async function getNewsletterData(date: Date) {
    const formattedDate = new Date(date);
    formattedDate.setHours(0, 0, 0, 0);

    return await prisma.newsletter.findUnique({
        where: { date: formattedDate }
    });
}

function AssetCard({
    title,
    description,
    type,
    src
}: {
    title: string;
    description: string;
    type: 'audio' | 'image' | 'video';
    src: string;
}) {
    return (
        <div className="bg-secondary/10 p-6 rounded-3xl border border-border/40 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-3 text-primary mb-2">
                {type === 'audio' && <Play size={20} />}
                {type === 'image' && <ImageIcon size={20} />}
                {type === 'video' && <Video size={20} />}
                <h3 className="font-dynapuff text-lg">{title}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

            {type === 'audio' && (
                <audio controls className="w-full h-10 mt-4 opacity-80 hover:opacity-100 transition-opacity">
                    <source src={src} type="audio/mpeg" />
                </audio>
            )}

            {type === 'image' && (
                <img src={src} alt={title} className="w-full rounded-2xl border border-border/20 shadow-sm" />
            )}

            {type === 'video' && (
                <video controls className="w-full rounded-2xl border border-border/20 shadow-sm">
                    <source src={src} type="video/mp4" />
                </video>
            )}
        </div>
    );
}

export default async function NewsletterPage({
    searchParams,
}: {
    searchParams: { date?: string };
}) {
    const params = await searchParams;
    const requestedDate = params.date ? new Date(params.date) : new Date();
    const year = format(requestedDate, 'yyyy');
    const month = format(requestedDate, 'MM');
    const day = format(requestedDate, 'dd');
    const basePath = `newsletter/${year}/${month}/${day}`;

    const dbRecord = await getNewsletterData(requestedDate);

    // List of assets from the S3 structure
    const assets = [
        { id: '01', title: 'The Anchor', desc: 'Hero image of the day.', type: 'image' as const, file: '01-anchor-image.png' },
        { id: '02', title: 'The Quote', desc: 'Audio recording of the daily quote.', type: 'audio' as const, file: '02-anchor-quote.mp3' },
        { id: '03', title: 'Deep Elaboration', desc: 'Deeper context on the daily focus.', type: 'audio' as const, file: '03-anchor-elaboration.mp3' },
        { id: '05', title: 'The Guide', desc: 'A short visual guidance session.', type: 'video' as const, file: '05-anchor-avatar.mp4' },
        { id: '06', title: 'Daily Headline', desc: 'The defining headline of today.', type: 'audio' as const, file: '06-headline.mp3' },
        { id: '07', title: 'The Gist', desc: 'Brief overview of world events.', type: 'audio' as const, file: '07-gist.mp3' },
    ];

    return (
        <main className="min-h-screen bg-background py-12 px-6">
            <div className="max-w-6xl mx-auto space-y-12">
                <header className="text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        <Headset size={16} />
                        The Daily Audio Experience
                    </div>
                    <h1 className="text-5xl font-dynapuff text-primary">b.newsletter</h1>
                    <p className="text-muted-foreground text-lg tracking-wide max-w-2xl mx-auto">
                        A curated multisensory journey through the day's essence, delivered with clarity and calm.
                    </p>
                    <div className="text-muted-foreground font-light tracking-widest uppercase">
                        {format(requestedDate, 'MMMM do, yyyy')}
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assets.map((asset) => (
                        <AssetCard
                            key={asset.id}
                            title={asset.title}
                            description={asset.desc}
                            type={asset.type}
                            src={getS3Url(`${basePath}/${asset.file}`)}
                        />
                    ))}
                </div>

                {dbRecord?.blogS3Url && (
                    <div className="pt-12 text-center">
                        <Link
                            href={`/blog?date=${format(requestedDate, 'yyyy-MM-dd')}`}
                            className="inline-flex items-center gap-3 px-10 py-4 bg-primary text-primary-foreground 
                            rounded-full font-medium tracking-wide shadow-md hover:shadow-xl 
                            transition-all duration-300 hover:-translate-y-1"
                        >
                            <BookOpen size={20} />
                            Read the Full Blog Post
                        </Link>
                    </div>
                )}

                {/* Footer simple content */}
                <footer className="text-center pt-20 text-muted-foreground/40 text-sm">
                    <p>Designed for a focused mind. Just be.</p>
                </footer>
            </div>
        </main>
    );
}
