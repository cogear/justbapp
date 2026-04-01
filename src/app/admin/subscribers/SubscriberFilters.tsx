'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Search } from 'lucide-react';

export function SubscriberFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }
        params.set('page', '1');
        router.replace(`/admin/subscribers?${params.toString()}`);
    }, 300);

    const showDisabled = searchParams.get('showDisabled') === 'true';

    function handleToggleDisabled() {
        const params = new URLSearchParams(searchParams);
        if (showDisabled) {
            params.delete('showDisabled');
        } else {
            params.set('showDisabled', 'true');
        }
        params.set('page', '1');
        router.replace(`/admin/subscribers?${params.toString()}`);
    }

    return (
        <div className="mb-6 p-4 bg-card border border-border rounded-xl shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                    type="text"
                    placeholder="Search by email..."
                    defaultValue={searchParams.get('search') || ''}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none whitespace-nowrap">
                <input
                    type="checkbox"
                    checked={showDisabled}
                    onChange={handleToggleDisabled}
                    className="rounded border-border"
                />
                Show disabled
            </label>
        </div>
    );
}
