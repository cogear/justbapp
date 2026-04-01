import { getSubscribers } from './actions';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { SubscriberFilters } from './SubscriberFilters';
import { SubscriberTable } from './SubscriberTable';

export default async function AdminSubscribersPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams;
    const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
    const search = typeof params.search === 'string' ? params.search : undefined;
    const showDisabled = params.showDisabled === 'true';

    const { subscribers, totalCount, totalPages, currentPage } = await getSubscribers({
        page,
        pageSize: 50,
        search,
        showDisabled,
    });

    const PaginationLink = ({ p, disabled, children }: { p: number, disabled?: boolean, children: React.ReactNode }) => {
        if (disabled) return <span className="px-3 py-1 text-muted-foreground opacity-50 cursor-not-allowed">{children}</span>;

        const query = new URLSearchParams();
        if (search) query.set('search', search);
        if (showDisabled) query.set('showDisabled', 'true');
        query.set('page', p.toString());

        return (
            <Link href={`/admin/subscribers?${query.toString()}`} className="px-3 py-1 bg-secondary hover:bg-secondary/80 rounded-md transition-colors">
                {children}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Link href="/admin/events" className="p-1 hover:bg-muted rounded-md transition-colors text-muted-foreground mr-1">
                                <ArrowLeft size={18} />
                            </Link>
                            <h1 className="text-3xl font-light">Subscribers</h1>
                        </div>
                        <div className="flex gap-4 mb-4">
                            <Link href="/admin/news" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                                News Manager
                            </Link>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            {totalCount} total subscriber{totalCount === 1 ? '' : 's'}
                            {search && ` matching "${search}"`}
                        </p>
                    </div>
                </div>

                <SubscriberFilters />
                <SubscriberTable subscribers={subscribers} />

                {totalPages > 1 && (
                    <div className="mt-4 p-4 border border-border rounded-xl bg-card flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
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
                )}
            </div>
        </div>
    );
}
