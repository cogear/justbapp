'use server';

import prisma from '@/lib/prisma';
import { discoverEventSources } from '@/lib/events/discovery';
import { extractEventsFromUrl } from '@/lib/events/extraction';
import { geocodeAddress } from '@/lib/events/geocoding';
import { revalidatePath } from 'next/cache';
import { stackServerApp } from '@/lib/stack';

export async function updateUserZip(zipCode: string) {
    const user = await stackServerApp.getUser();
    if (!user?.primaryEmail) return { success: false, error: 'User not found' };

    try {
        await prisma.user.update({
            where: { email: user.primaryEmail },
            data: { zipCode }
        });
        revalidatePath('/getout');
        return { success: true };
    } catch (error) {
        console.error('Failed to update zip:', error);
        return { success: false, error: 'Failed to update zip code' };
    }
}

export async function findEvents(zipCode: string) {
    if (!zipCode) return { success: false, error: 'Zip code is required' };

    try {
        // 1. Discovery Phase
        const sources = await discoverEventSources(zipCode);

        if (sources.length === 0) {
            return { success: true, count: 0, message: 'No sources found for this area yet.' };
        }

        let totalEvents = 0;

        // 2. Extraction Phase (Parallel processing)
        const extractionPromises = sources.map(async (source) => {
            // Pass source name as default location context
            const extractedEvents = await extractEventsFromUrl(source.url, source.name);

            // 3. Processing & Storage Phase
            for (const eventData of extractedEvents) {
                // Determine if online
                const isOnline = eventData.locationName?.toLowerCase().includes('online') ||
                    eventData.address?.toLowerCase().includes('zoom') ||
                    eventData.address?.toLowerCase().includes('virtual');

                // Geocode
                let coords = null;
                if (!isOnline) {
                    coords = await geocodeAddress(eventData.address || eventData.locationName);
                }

                // Enforce Address/Geocoding Requirement
                if (!isOnline && (!coords || !coords.latitude)) {
                    console.warn(`Skipping event "${eventData.title}" - No valid address/coordinates found.`);
                    continue;
                }

                // Save to DB (Upsert based on title + date + location to avoid dupes)
                // For simplicity in this demo, we'll just create or ignore if exists
                // A real app needs robust de-duplication logic

                const existing = await prisma.event.findFirst({
                    where: {
                        title: eventData.title,
                        startTime: eventData.startTime
                    }
                });

                if (!existing) {
                    await prisma.event.create({
                        data: {
                            title: eventData.title,
                            description: eventData.description,
                            locationName: eventData.locationName,
                            address: eventData.address,
                            startTime: eventData.startTime,
                            endTime: eventData.endTime,
                            tags: eventData.tags,
                            sourceUrl: eventData.sourceUrl,
                            latitude: coords?.latitude,
                            longitude: coords?.longitude,
                            zipCode: zipCode,
                            category: eventData.category,
                            rawText: JSON.stringify(eventData) // Storing full object for debug
                        }
                    });
                    totalEvents++;
                }
            }
        });

        await Promise.all(extractionPromises);

        revalidatePath('/getout');
        return { success: true, count: totalEvents };

    } catch (error) {
        console.error('Error in event discovery pipeline:', error);
        return { success: false, error: 'Failed to discover events' };
    }
}

import { Event } from '@prisma/client';

export async function getEvents(zipCode?: string): Promise<Event[]> {
    // If zip provided, filter by it. Otherwise return all (or nearest).
    // For this demo, we'll just return all if no zip, or filter if zip.

    const where = zipCode ? { zipCode } : {};

    const events = await prisma.event.findMany({
        where,
        orderBy: { startTime: 'asc' }
    });

    return events;
}
