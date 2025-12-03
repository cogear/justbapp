import React from 'react';
import prisma from '@/lib/prisma';
import { updateEvent } from './actions';
import { Calendar, MapPin, Clock, Tag, Link as LinkIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const event = await prisma.event.findUnique({
        where: { id },
    });

    if (!event) {
        notFound();
    }

    // Helper to format date for datetime-local input (YYYY-MM-DDThh:mm)
    const formatDateForInput = (date: Date) => {
        return format(date, "yyyy-MM-dd'T'HH:mm");
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-8 font-sans">
            <div className="max-w-2xl mx-auto">
                <Link href="/admin/events" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-2" /> Back to Events
                </Link>

                <h1 className="text-3xl font-light mb-2">Edit Event</h1>
                <p className="text-muted-foreground mb-8">Update event details.</p>

                <form action={updateEvent} className="space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                    <input type="hidden" name="id" value={event.id} />

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Event Title</label>
                        <input
                            name="title"
                            type="text"
                            required
                            defaultValue={event.title}
                            className="w-full bg-background border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Description</label>
                        <textarea
                            name="description"
                            required
                            rows={6}
                            defaultValue={event.description}
                            className="w-full bg-background border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                        />
                    </div>

                    {/* Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Clock size={16} /> Starts
                            </label>
                            <input
                                name="startTime"
                                type="datetime-local"
                                required
                                defaultValue={formatDateForInput(event.startTime)}
                                className="w-full bg-background border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Clock size={16} /> Ends (Optional)
                            </label>
                            <input
                                name="endTime"
                                type="datetime-local"
                                defaultValue={event.endTime ? formatDateForInput(event.endTime) : ''}
                                className="w-full bg-background border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <MapPin size={16} /> Location Name
                            </label>
                            <input
                                name="locationName"
                                type="text"
                                required
                                defaultValue={event.locationName || ''}
                                className="w-full bg-background border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Address</label>
                            <input
                                name="address"
                                type="text"
                                defaultValue={event.address || ''}
                                className="w-full bg-background border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Latitude</label>
                                <input
                                    name="latitude"
                                    type="number"
                                    step="any"
                                    defaultValue={event.latitude || ''}
                                    className="w-full bg-background border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Longitude</label>
                                <input
                                    name="longitude"
                                    type="number"
                                    step="any"
                                    defaultValue={event.longitude || ''}
                                    className="w-full bg-background border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category & Link */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Tag size={16} /> Category
                            </label>
                            <select
                                name="category"
                                defaultValue={event.category || 'Community'}
                                className="w-full bg-background border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none appearance-none"
                            >
                                <option value="Social">Social</option>
                                <option value="Creative">Creative</option>
                                <option value="Active">Active</option>
                                <option value="Intellectual">Intellectual</option>
                                <option value="Community">Community</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <LinkIcon size={16} /> Link (Optional)
                            </label>
                            <input
                                name="sourceUrl"
                                type="url"
                                defaultValue={event.sourceUrl || ''}
                                className="w-full bg-background border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Link
                            href="/admin/events"
                            className="flex-1 bg-secondary text-secondary-foreground font-medium py-4 rounded-lg hover:opacity-90 transition-opacity text-center"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="flex-1 bg-primary text-primary-foreground font-medium py-4 rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
