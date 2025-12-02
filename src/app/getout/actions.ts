'use server';

import prisma from '@/lib/prisma';
import { discoverEventSources } from '@/lib/events/discovery';
import { extractEventsFromUrl } from '@/lib/events/extraction';
import { geocodeAddress } from '@/lib/events/geocoding';
import { revalidatePath } from 'next/cache';

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
            const extractedEvents = await extractEventsFromUrl(source.url);

            // 3. Processing & Storage Phase
            for (const eventData of extractedEvents) {
                // Geocode
                const coords = await geocodeAddress(eventData.location);

                // Save to DB (Upsert based on title + date + location to avoid dupes)
                // For simplicity in this demo, we'll just create or ignore if exists
                // A real app needs robust de-duplication logic

                const existing = await prisma.event.findFirst({
                    where: {
                        title: eventData.title,
                        date: eventData.date
                    }
                });

                if (!existing) {
                    await prisma.event.create({
                        data: {
                            title: eventData.title,
                            description: eventData.description,
                            location: eventData.location,
                            date: eventData.date,
                            tags: eventData.tags,
                            sourceUrl: eventData.sourceUrl,
                            latitude: coords?.lat,
                            longitude: coords?.lng,
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

export async function getEvents(zipCode?: string) {
    // If zip provided, filter by it. Otherwise return all (or nearest).
    // For this demo, we'll just return all if no zip, or filter if zip.

    const where = zipCode ? { zipCode } : {};

    const events = await prisma.event.findMany({
        where,
        orderBy: { date: 'asc' }
    });

    return events;
}
