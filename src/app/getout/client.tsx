'use client';

import React, { useState, useEffect } from 'react';
import { findEvents, getEvents, updateUserZip } from './actions';
import { Event } from '@prisma/client';

// Types for our UI
interface EventDisplay extends Event {
    // Prisma Event type + any extras if needed
}

interface GetOutClientProps {
    initialZip: string | null;
    initialEvents: Event[];
}

export default function GetOutClient({ initialZip, initialEvents }: GetOutClientProps) {
    const [zipCode, setZipCode] = useState(initialZip || '');
    const [hasLocation, setHasLocation] = useState(!!initialZip);
    const [isSearching, setIsSearching] = useState(false);
    const [status, setStatus] = useState('');
    const [events, setEvents] = useState<Event[]>(initialEvents);

    const handleSetLocation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!zipCode.trim()) return;

        setIsSearching(true);
        setStatus('Saving location...');

        try {
            // 1. Save Zip
            const saveResult = await updateUserZip(zipCode);
            if (!saveResult.success) {
                setStatus('Failed to save location.');
                return;
            }

            setHasLocation(true);
            setStatus('Deploying agents to the grid...');

            // 2. Trigger Discovery
            const result = await findEvents(zipCode);

            if (result.success) {
                setStatus(`Agents returned safely. Found ${result.count} new events.`);
                const freshEvents = await getEvents(zipCode);
                setEvents(freshEvents);
            } else {
                setStatus(`Mission failed: ${result.error}`);
            }
        } catch (err) {
            console.error(err);
            setStatus('Connection lost.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleRefresh = async () => {
        if (!zipCode) return;
        setIsSearching(true);
        setStatus('Refreshing intel...');
        try {
            const result = await findEvents(zipCode);
            if (result.success) {
                const freshEvents = await getEvents(zipCode);
                setEvents(freshEvents);
                setStatus('Updated.');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSearching(false);
        }
    };

    if (!hasLocation) {
        return (
            <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-in fade-in">
                <div className="max-w-md w-full space-y-8 text-center">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-dynapuff text-primary">b.getout</h1>
                        <p className="text-muted-foreground text-lg">
                            To discover local events, we need to know where you are.
                        </p>
                    </div>

                    <form onSubmit={handleSetLocation} className="space-y-4">
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
                                text-lg text-center shadow-sm outline-none
                            "
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={isSearching || !zipCode}
                            className="
                                w-full px-6 py-4 rounded-full
                                bg-primary text-primary-foreground font-medium text-lg
                                hover:shadow-md hover:scale-[1.02]
                                transition-all duration-300
                                disabled:opacity-50
                            "
                        >
                            {isSearching ? 'Saving...' : 'Start Exploring'}
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background flex flex-col items-center p-6 transition-opacity duration-1000 animate-in fade-in">
            <div className="w-full max-w-4xl space-y-12">
                <header className="text-center space-y-4 mt-12">
                    <h1 className="text-4xl font-dynapuff text-primary">
                        b.getout
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        Happening near <span className="font-medium text-foreground">{zipCode}</span>
                    </p>
                    <button
                        onClick={() => setHasLocation(false)}
                        className="text-xs text-muted-foreground hover:text-primary underline"
                    >
                        Change Location
                    </button>
                </header>

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
                    {events.length === 0 && !isSearching && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            <p>No events found yet.</p>
                            <button onClick={handleRefresh} className="mt-4 text-primary hover:underline">
                                Scan for events
                            </button>
                        </div>
                    )}

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
                                    {new Date(event.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
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
                                    {event.locationName || event.address || 'Unknown Location'}
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
