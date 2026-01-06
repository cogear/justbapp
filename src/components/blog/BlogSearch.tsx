
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce'; // Assuming we have this, checking package.json in next step or implementing manual debounce
import { Search } from 'lucide-react';

export function BlogSearch({ placeholder }: { placeholder: string }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        params.delete('offset'); // Reset pagination on search
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    return (
        <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-200">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground/50">
                <Search size={18} />
            </div>
            <input
                className="
                    block w-full pl-10 pr-4 py-3 
                    bg-secondary/10 border border-border/40 
                    rounded-full text-base placeholder:text-muted-foreground/40
                    focus:outline-none focus:ring-1 focus:ring-primary/30 focus:bg-secondary/20
                    transition-all duration-300
                "
                placeholder={placeholder}
                defaultValue={searchParams.get('q')?.toString()}
                onChange={(e) => handleSearch(e.target.value)}
            />
        </div>
    );
}
