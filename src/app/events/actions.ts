'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { geocodeAddress } from '@/lib/events/geocoding';

export async function createEvent(formData: FormData): Promise<void> {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const startTime = new Date(formData.get('startTime') as string);
    const endTimeStr = formData.get('endTime') as string;
    const endTime = endTimeStr ? new Date(endTimeStr) : null;
    const locationName = formData.get('locationName') as string;
    const address = formData.get('address') as string;
    const category = formData.get('category') as string;
    const sourceUrl = formData.get('sourceUrl') as string;

    if (!title || !startTime || !locationName) {
        throw new Error('Missing required fields');
    }

    let latitude: number | null = null;
    let longitude: number | null = null;

    if (address) {
        const geo = await geocodeAddress(address);
        if (geo) {
            latitude = geo.latitude;
            longitude = geo.longitude;
        }
    }

    try {
        await prisma.event.create({
            data: {
                title,
                description,
                startTime,
                endTime,
                locationName,
                address,
                latitude,
                longitude,
                category,
                sourceUrl,
                source: 'USER',
            },
        });
    } catch (error) {
        console.error('Failed to create event:', error);
        throw new Error('Failed to create event');
    }

    revalidatePath('/events');
    redirect('/events');
}
