'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NewsCard from '@/components/NewsCard';

// Mock Data
const MOCK_NEWS = {
    anxious: [
        {
            id: 1,
            title: "Community Garden Project Brings Neighbors Together",
            summary: "In a heartwarming display of community spirit, local residents have transformed a long-vacant lot into a thriving community garden. What was once an eyesore is now a vibrant green space teeming with vegetables, flowers, and laughter. The project has not only provided fresh, organic produce for the neighborhood but has also become a central hub for connection, where neighbors of all ages gather to work the soil, share stories, and build lasting friendships.",
            source: "Good News Network",
            url: "#"
        },
        {
            id: 2,
            title: "New Study Shows Benefits of 5-Minute Meditation",
            summary: "A groundbreaking new study reveals that just five minutes of daily mindfulness practice can have a profound impact on mental well-being. Researchers found that participants who engaged in brief, consistent meditation sessions experienced significantly reduced stress levels, improved focus, and better emotional regulation. This finding offers a practical and accessible tool for anyone looking to enhance their mental health amidst a busy schedule.",
            source: "Mindful Daily",
            url: "#"
        },
        {
            id: 3,
            title: "Artist Creates Sculptures from Recycled Ocean Plastic",
            summary: "Turning the tide on pollution, a visionary artist is transforming discarded ocean plastic into breathtaking sculptures. These intricate works of art not only captivate viewers with their beauty but also serve as a powerful reminder of the importance of environmental conservation. By repurposing waste into wonder, the artist is raising awareness and inspiring action to clean up our oceans, one piece of plastic at a time.",
            source: "Art & Soul",
            url: "#"
        }
    ],
    resilient: [
        {
            id: 4,
            title: "Global Clean Energy Investment Hits Record High",
            summary: "In a historic milestone for the planet, global investment in renewable energy technologies has surpassed investment in fossil fuels for the first time. This major shift signals a decisive move towards a sustainable future, driven by falling costs of solar and wind power and increasing commitment from nations worldwide. The surge in green energy funding promises to accelerate the transition to a low-carbon economy and combat climate change.",
            source: "Energy Today",
            url: "#"
        },
        {
            id: 5,
            title: "Tech Giant Launches Initiative to Close Digital Divide",
            summary: "Aiming to empower underserved communities, a major tech giant has launched a comprehensive initiative to bridge the digital divide. The program will provide high-speed internet access, devices, and digital literacy training to millions of people in remote and low-income areas. By connecting the unconnected, this initiative seeks to unlock educational and economic opportunities, fostering a more inclusive global digital economy.",
            source: "TechCrunch",
            url: "#"
        },
        {
            id: 6,
            title: "Breakthrough in Alzheimer's Research Announced",
            summary: "Offering new hope to millions, scientists have announced a significant breakthrough in Alzheimer's research. They have identified a novel potential target for treatment that could slow or even halt the progression of the disease. This discovery opens up new avenues for drug development and brings us one step closer to finding a cure for this debilitating condition, providing a beacon of optimism for patients and their families.",
            source: "Science Daily",
            url: "#"
        },
        {
            id: 7,
            title: "Urban Reforestation Plan Approved by City Council",
            summary: "Taking a bold step towards a greener city, the City Council has approved an ambitious urban reforestation plan. The initiative aims to plant 10,000 new trees over the next five years, strategically placing them to combat heat islands and improve air quality. This massive greening effort will not only beautify the cityscape but also provide essential shade, reduce energy costs, and create healthier living environments for all residents.",
            source: "City Gazette",
            url: "#"
        },
        {
            id: 8,
            title: "Youth-Led Climate Action Summit Draws Thousands",
            summary: "Demonstrating the power of the next generation, a youth-led climate action summit has drawn thousands of passionate young leaders from around the globe. United by a shared urgency, they gathered to demand bold policy changes and sustainable practices. The summit featured inspiring speeches, workshops, and collaborative sessions, amplifying the voices of youth and solidifying their role as key drivers in the global fight against climate change.",
            source: "Global Citizen",
            url: "#"
        }
    ]
};

function BriefContent() {
    const router = useRouter();
    // In a real app, we would fetch the user's latest pulse here.
    // For now, let's randomize it or default to "anxious" to show the "Solution-focused" flow.
    const [userState, setUserState] = useState<'anxious' | 'resilient'>('anxious');

    useEffect(() => {
        // Randomly assign state for demo purposes
        setUserState(Math.random() > 0.5 ? 'resilient' : 'anxious');
    }, []);

    const newsItems = MOCK_NEWS[userState];

    const handleDone = () => {
        // Navigate to "Done" state
        router.push('/?done=true');
    };

    return (
        <main className="min-h-screen bg-background flex flex-col items-center py-12 px-6 transition-opacity duration-1000 animate-in fade-in">
            <div className="w-full max-w-lg space-y-8">
                <header className="text-center space-y-2">
                    <h1 className="text-3xl font-dynapuff text-primary">
                        b.brief
                    </h1>
                    <p className="text-muted-foreground text-sm tracking-wide">
                        {userState === 'anxious'
                            ? "Gentle updates for a softer world."
                            : "Direct updates for a focused mind."}
                    </p>
                </header>

                <div className="space-y-4">
                    {newsItems.map((item) => (
                        <div key={item.id} className="animate-in slide-in-from-bottom-4 fade-in duration-700" style={{ animationDelay: `${item.id * 100}ms` }}>
                            <NewsCard
                                title={item.title}
                                summary={item.summary}
                                source={item.source}
                                url={item.url}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex justify-center pt-8 pb-12">
                    <button
                        onClick={handleDone}
                        className="
                            px-12 py-3 rounded-full
                            bg-primary text-primary-foreground font-medium tracking-wide
                            shadow-md hover:shadow-lg hover:bg-primary/90
                            transition-all duration-300 hover:-translate-y-0.5
                        "
                    >
                        Done
                    </button>
                </div>
            </div>
        </main>
    );
}

export default function BriefPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </main>
        }>
            <BriefContent />
        </Suspense>
    );
}
