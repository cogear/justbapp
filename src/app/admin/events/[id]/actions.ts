'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateEvent(formData: FormData) {
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    const locationName = formData.get('locationName') as string;
    const address = formData.get('address') as string;
    const category = formData.get('category') as string;
    const sourceUrl = formData.get('sourceUrl') as string;

    const latitude = formData.get('latitude') as string;
    const longitude = formData.get('longitude') as string;

    if (!id || !title || !startTime || !locationName) {
        throw new Error('Missing required fields');
    }

    await prisma.event.update({
        where: { id },
        data: {
            title,
            description,
            startTime: new Date(startTime),
            endTime: endTime ? new Date(endTime) : null,
            locationName,
            address,
            category,
            sourceUrl: sourceUrl || null,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
        },
    });

    revalidatePath('/admin/events');
    redirect('/admin/events');
}
