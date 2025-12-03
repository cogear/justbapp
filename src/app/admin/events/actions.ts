'use server';

import prisma from '@/lib/prisma';
import { Event } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function deleteEvent(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) return;

    try {
        await prisma.event.delete({
            where: { id },
        });
        revalidatePath('/admin/events');
    } catch (error) {
        console.error('Failed to delete event:', error);
    }
}

export type SortColumn = 'title' | 'startTime' | 'locationName' | 'source' | 'category';
export type SortDirection = 'asc' | 'desc';

export interface GetAdminEventsParams {
    page?: number;
    pageSize?: number;
    sortColumn?: SortColumn;
    sortDirection?: SortDirection;
    search?: string;
    source?: string;
    startDate?: string;
    endDate?: string;
    category?: string;
}

export interface GetAdminEventsResult {
    events: Event[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}

export async function getAdminEvents({
    page = 1,
    pageSize = 50,
    sortColumn = 'startTime',
    sortDirection = 'desc',
    search,
    source,
    startDate,
    endDate,
    category
}: GetAdminEventsParams): Promise<GetAdminEventsResult> {
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (source) {
        where.source = source;
    }

    if (category && category !== 'All') {
        where.category = category;
    }

    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { locationName: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } }
        ];
    }

    if (startDate || endDate) {
        where.startTime = {};
        if (startDate) where.startTime.gte = new Date(startDate);
        if (endDate) where.startTime.lte = new Date(endDate);
    }

    const [events, totalCount] = await Promise.all([
        prisma.event.findMany({
            where,
            orderBy: { [sortColumn]: sortDirection },
            skip,
            take: pageSize,
        }),
        prisma.event.count({ where })
    ]);

    return {
        events,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page
    };
}
