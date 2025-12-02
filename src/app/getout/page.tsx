'use client';

import React, { useState, Suspense } from 'react';
import { findEvents, getEvents } from './actions';

// Types for our UI
interface EventDisplay {
    id: string;
    title: string;
    description: string;
    location: string;
    date: Date;
    category: string | null;
    tags: string[];
    sourceUrl: string | null;
}

function GetOutContent() {
    const [zipCode, setZipCode] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [status, setStatus] = useState('');
    const [events, setEvents] = useState<EventDisplay[]>([]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!zipCode.trim()) return;

        setIsSearching(true);
        setStatus('Deploying agents to the grid...');
        setEvents([]); // Clear previous

        try {
            // 1. Trigger Discovery Pipeline
            const result = await findEvents(zipCode);

            if (result.success) {
                setStatus(`Agents returned safely. Found ${result.count} new events.`);

                // 2. Fetch the newly saved events
                const freshEvents = await getEvents(zipCode);
                setEvents(freshEvents);
            } else {
                setStatus(`Mission failed: ${result.error}`);
            }
        } catch (err) {
            setStatus('Connection lost with agents.');
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <main className="min-h-screen bg-background flex flex-col items-center p-6 transition-opacity duration-1000 animate-in fade-in">
            <div className="w-full max-w-4xl space-y-12">
                <header className="text-center space-y-4 mt-12">
                    <h1 className="text-4xl font-dynapuff text-primary">
                        b.getout
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        Discover what's happening in your community.
                        Our AI agents scour local bulletin boards so you don't have to.
                    </p>
                </header>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="max-w-md mx-auto relative">
                    <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="Enter Zip Code (e.g. 32935)"
                        className="
                            w-full px-6 py-4 rounded-full
                            bg-secondary/50 backdrop-blur-sm
                            border-2 border-transparent focus:border-primary/50
                            text-foreground placeholder:text-muted-foreground
                            text-lg shadow-sm transition-all duration-300
                            outline-none
                        "
                    />
                    <button
                        type="submit"
                        disabled={isSearching || !zipCode}
                        className="
                            absolute right-2 top-2 bottom-2
                            px-6 rounded-full
                            bg-primary text-primary-foreground font-medium
                            hover:shadow-md hover:scale-105
                            transition-all duration-300
                            disabled:opacity-50 disabled:cursor-not-allowed
                        "
                    >
                        {isSearching ? 'Scanning...' : 'Search'}
                    </button>
                </form>

                {/* Status Message */}
                {status && (
                    <div className="text-center animate-in fade-in slide-in-from-top-4">
                        <p className={`text-sm font-medium tracking-wide ${status.includes('failed') ? 'text-destructive' : 'text-primary'}`}>
                            {status}
                        </p>
                    </div>
                )}

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {events.map((event, index) => (
                        <div
                            key={event.id}
                            className="
                                bg-card text-card-foreground rounded-3xl p-6
                                border border-border/50 shadow-sm
                                hover:shadow-md hover:-translate-y-1
                                transition-all duration-300
                                animate-in fade-in slide-in-from-bottom-8
                            "
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="
                                    px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider
                                    bg-secondary text-secondary-foreground
                                ">
                                    {event.category || 'Event'}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                            </div>

                            <h3 className="text-xl font-serif mb-2 line-clamp-2">
                                {event.title}
                            </h3>

                            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                                {event.description}
                            </p>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-primary/50"></span>
                                    {event.location.split(',')[0]}
                                </div>
                                {event.sourceUrl && (
                                    <a
                                        href={event.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-medium text-primary hover:underline"
                                    >
                                        Source →
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}

export default function GetOutPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </main>
        }>
            <GetOutContent />
        </Suspense>
    );
}
