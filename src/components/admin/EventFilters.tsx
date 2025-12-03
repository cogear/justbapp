'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Search, Calendar } from 'lucide-react';

export function EventFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }
        params.set('page', '1'); // Reset pagination
        router.replace(`/admin/events?${params.toString()}`);
    }, 300);

    const handleDateChange = (key: 'startDate' | 'endDate', value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.set('page', '1');
        router.replace(`/admin/events?${params.toString()}`);
    };

    const handleCategoryChange = (category: string) => {
        const params = new URLSearchParams(searchParams);
        if (category && category !== 'All') {
            params.set('category', category);
        } else {
            params.delete('category');
        }
        params.set('page', '1');
        router.replace(`/admin/events?${params.toString()}`);
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-card border border-border rounded-xl shadow-sm">
            {/* Search */}
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                    type="text"
                    placeholder="Search events..."
                    defaultValue={searchParams.get('search') || ''}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-48">
                <select
                    defaultValue={searchParams.get('category') || 'All'}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none appearance-none"
                >
                    <option value="All">All Categories</option>
                    <option value="Social">Social</option>
                    <option value="Creative">Creative</option>
                    <option value="Active">Active</option>
                    <option value="Intellectual">Intellectual</option>
                    <option value="Community">Community</option>
                </select>
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2">
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                        type="date"
                        defaultValue={searchParams.get('startDate') || ''}
                        onChange={(e) => handleDateChange('startDate', e.target.value)}
                        className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                    />
                </div>
                <span className="text-muted-foreground">-</span>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                        type="date"
                        defaultValue={searchParams.get('endDate') || ''}
                        onChange={(e) => handleDateChange('endDate', e.target.value)}
                        className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                    />
                </div>
            </div>
        </div>
    );
}
