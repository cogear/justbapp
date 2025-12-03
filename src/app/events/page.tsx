import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import Link from 'next/link';
import { MapPin, Calendar, Clock, Tag, ExternalLink } from 'lucide-react';

import { geocodeAddress, getDistanceInMiles } from '@/lib/events/geocoding';

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const { category, search } = await searchParams;

    let searchLat: number | null = null;
    let searchLng: number | null = null;

    if (search && typeof search === 'string') {
        const geo = await geocodeAddress(search);
        if (geo) {
            searchLat = geo.latitude;
            searchLng = geo.longitude;
        }
    }

    const where = category && typeof category === 'string' ? { category } : {};

    const events = await prisma.event.findMany({
        where: {
            ...where,
            startTime: {
                gte: new Date(), // Only future events
            },
        },
        orderBy: { startTime: 'asc' },
    });

    // Filter by distance if search is active (e.g., within 50 miles)
    const filteredEvents = (searchLat && searchLng)
        ? events.filter(e => {
            if (!e.latitude || !e.longitude) return false;
            const dist = getDistanceInMiles(searchLat!, searchLng!, e.latitude, e.longitude);
            return dist <= 50; // 50 mile radius
        }).map(e => ({
            ...e,
            distance: getDistanceInMiles(searchLat!, searchLng!, e.latitude!, e.longitude!)
        })).sort((a, b) => a.distance - b.distance)
        : events;

    const categories = ['Social', 'Creative', 'Active', 'Intellectual', 'Community'];

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-light mb-2">Get Out & Just Be</h1>
                        <p className="text-muted-foreground">Discover nourishing local events to reconnect with your community.</p>
                    </div>
                    <Link href="/events/submit" className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity shadow-sm">
                        + Submit Event
                    </Link>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
                    <form className="relative w-full md:w-96">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            name="search"
                            defaultValue={typeof search === 'string' ? search : ''}
                            placeholder="Search city, zip, or 'Near Me'"
                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-full focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                        {category && <input type="hidden" name="category" value={category as string} />}
                    </form>

                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={`/events${search ? `?search=${search}` : ''}`}
                            className={`px-4 py-2 rounded-full text-sm border transition-colors ${!category ? 'bg-foreground text-background border-foreground' : 'bg-background text-muted-foreground border-border hover:border-foreground'}`}
                        >
                            All
                        </Link>
                        {categories.map(c => (
                            <Link
                                key={c}
                                href={`/events?category=${c}${search ? `&search=${search}` : ''}`}
                                className={`px-4 py-2 rounded-full text-sm border transition-colors ${category === c ? 'bg-foreground text-background border-foreground' : 'bg-background text-muted-foreground border-border hover:border-foreground'}`}
                            >
                                {c}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Event Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                        <div key={event.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="inline-block px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium uppercase tracking-wide">
                                        {event.category}
                                    </span>
                                    {'distance' in event && (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <MapPin size={12} />
                                            {Math.round((event as any).distance)} mi
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-xl font-medium mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
                                <p className="text-muted-foreground text-sm line-clamp-3 mb-4">{event.description}</p>

                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-primary" />
                                        <span>{format(event.startTime, 'EEEE, MMMM d')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-primary" />
                                        <span>
                                            {format(event.startTime, 'h:mm a')}
                                            {event.endTime && ` - ${format(event.endTime, 'h:mm a')}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-primary" />
                                        <span className="line-clamp-1">{event.locationName}</span>
                                    </div>
                                </div>
                            </div>

                            {event.sourceUrl && (
                                <div className="p-4 border-t border-border bg-muted/30">
                                    <a
                                        href={event.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-primary hover:underline"
                                    >
                                        View Details <ExternalLink size={14} />
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {filteredEvents.length === 0 && (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                            <MapPin size={32} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">No events found nearby</h3>
                        <p className="text-muted-foreground max-w-md mx-auto mb-6">
                            {search ? `We couldn't find any events within 50 miles of "${search}".` : "No upcoming events found."}
                        </p>
                        <Link href="/events/submit" className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity">
                            Submit an Event
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
