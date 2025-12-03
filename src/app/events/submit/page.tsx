'use client';

import React from 'react';
import { createEvent } from '../actions';
import { Calendar, MapPin, Clock, Tag, Link as LinkIcon } from 'lucide-react';

export default function SubmitEventPage() {
    return (
        <div className="min-h-screen bg-background text-foreground p-8 font-sans">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-light mb-2">Submit an Event</h1>
                <p className="text-muted-foreground mb-8">Share a nourishing activity with the community.</p>

                <form action={createEvent} className="space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm">

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Event Title</label>
                        <input
                            name="title"
                            type="text"
                            required
                            placeholder="e.g. Sunday Morning Yoga"
                            className="w-full bg-background border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Description</label>
                        <textarea
                            name="description"
                            required
                            rows={4}
                            placeholder="What's the vibe? Who is this for?"
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
                                placeholder="e.g. Central Park, The Book Nook"
                                className="w-full bg-background border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Address</label>
                            <input
                                name="address"
                                type="text"
                                placeholder="123 Main St, City, State"
                                className="w-full bg-background border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
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
                                placeholder="https://..."
                                className="w-full bg-background border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-foreground text-background font-medium py-4 rounded-lg hover:opacity-90 transition-opacity mt-8"
                    >
                        Publish Event
                    </button>
                </form>
            </div>
        </div>
    );
}
