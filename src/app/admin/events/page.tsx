import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { deleteEvent, getAdminEvents, SortColumn, SortDirection } from './actions';
import { Trash2, ExternalLink, MapPin, Calendar, Pencil, ChevronLeft, ChevronRight, ArrowUpDown, Tag } from 'lucide-react';
import Link from 'next/link';
import { EventFilters } from '@/components/admin/EventFilters';

export default async function AdminEventsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams;
    const source = typeof params.source === 'string' ? params.source : undefined;
    const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
    const sortColumn = (typeof params.sort === 'string' ? params.sort : 'startTime') as SortColumn;
    const sortDirection = (typeof params.dir === 'string' ? params.dir : 'desc') as SortDirection;
    const search = typeof params.search === 'string' ? params.search : undefined;
    const startDate = typeof params.startDate === 'string' ? params.startDate : undefined;
    const endDate = typeof params.endDate === 'string' ? params.endDate : undefined;
    const category = typeof params.category === 'string' ? params.category : undefined;

    const { events, totalCount, totalPages, currentPage } = await getAdminEvents({
        page,
        pageSize: 50,
        sortColumn,
        sortDirection,
        search,
        source,
        startDate,
        endDate,
        category
    });

    // Helper to generate sort links
    const SortHeader = ({ column, label }: { column: SortColumn, label: string }) => {
        const isActive = sortColumn === column;
        const nextDir = isActive && sortDirection === 'asc' ? 'desc' : 'asc';

        // Preserve other params
        const query = new URLSearchParams();
        if (source) query.set('source', source);
        if (search) query.set('search', search);
        if (startDate) query.set('startDate', startDate);
        if (endDate) query.set('endDate', endDate);
        if (category) query.set('category', category);
        if (page > 1) query.set('page', page.toString());
        query.set('sort', column);
        query.set('dir', nextDir);

        return (
            <Link href={`/admin/events?${query.toString()}`} className="flex items-center gap-1 hover:text-foreground transition-colors group">
                {label}
                <ArrowUpDown size={12} className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
            </Link>
        );
    };

    // Helper for pagination links
    const PaginationLink = ({ p, disabled, children }: { p: number, disabled?: boolean, children: React.ReactNode }) => {
        if (disabled) return <span className="px-3 py-1 text-muted-foreground opacity-50 cursor-not-allowed">{children}</span>;

        const query = new URLSearchParams();
        if (source) query.set('source', source);
        if (search) query.set('search', search);
        if (startDate) query.set('startDate', startDate);
        if (endDate) query.set('endDate', endDate);
        if (category) query.set('category', category);
        if (sortColumn) query.set('sort', sortColumn);
        if (sortDirection) query.set('dir', sortDirection);
        query.set('page', p.toString());

        return (
            <Link href={`/admin/events?${query.toString()}`} className="px-3 py-1 bg-secondary hover:bg-secondary/80 rounded-md transition-colors">
                {children}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-light">Event Manager</h1>
                        <p className="text-muted-foreground text-sm mt-1">{totalCount} events found</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/events/submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90">
                            + Add Event
                        </Link>
                        <Link href="/admin/sources/discover" className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:opacity-90">
                            Find Sources
                        </Link>
                    </div>
                </div>

                <EventFilters />

                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[600px]" suppressHydrationWarning>
                    <div className="flex-1 overflow-auto" suppressHydrationWarning>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 border-b border-border sticky top-0 z-10 backdrop-blur-sm">
                                <tr>
                                    <th className="p-4 font-medium text-muted-foreground"><SortHeader column="title" label="Title" /></th>
                                    <th className="p-4 font-medium text-muted-foreground"><SortHeader column="startTime" label="Date & Time" /></th>
                                    <th className="p-4 font-medium text-muted-foreground"><SortHeader column="locationName" label="Location" /></th>
                                    <th className="p-4 font-medium text-muted-foreground"><SortHeader column="category" label="Category" /></th>
                                    <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {events.map((event) => (
                                    <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium">{event.title}</div>
                                            <div className="text-xs text-muted-foreground line-clamp-1">{event.description}</div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-muted-foreground" />
                                                {format(event.startTime, 'MMM d, yyyy')}
                                            </div>
                                            <div className="text-xs text-muted-foreground pl-6">
                                                {format(event.startTime, 'h:mm a')}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-muted-foreground" />
                                                {event.locationName}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Tag size={14} className="text-muted-foreground" />
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                                    ${event.category === 'Social' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                                        event.category === 'Creative' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' :
                                                            event.category === 'Active' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                                                event.category === 'Intellectual' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                                    }`}>
                                                    {event.category}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {event.sourceUrl && (
                                                    <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="View Source">
                                                        <ExternalLink size={16} />
                                                    </a>
                                                )}
                                                <Link href={`/admin/events/${event.id}`} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors" title="Edit">
                                                    <Pencil size={16} />
                                                </Link>
                                                <form action={deleteEvent}>
                                                    <input type="hidden" name="id" value={event.id} />
                                                    <button type="submit" className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {events.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                            No events found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="p-4 border-t border-border bg-muted/20 flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages || 1}
                        </div>
                        <div className="flex gap-2">
                            <PaginationLink p={currentPage - 1} disabled={currentPage <= 1}>
                                <div className="flex items-center gap-1"><ChevronLeft size={14} /> Previous</div>
                            </PaginationLink>
                            <PaginationLink p={currentPage + 1} disabled={currentPage >= totalPages}>
                                <div className="flex items-center gap-1">Next <ChevronRight size={14} /></div>
                            </PaginationLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
