'use client';

import { useState } from 'react';
import { discoverSources, addSource, DiscoveredSource } from '../actions';
import { Loader2, Plus, Check, Search, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function DiscoverSourcesPage() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<DiscoveredSource[]>([]);
    const [addedUrls, setAddedUrls] = useState<Set<string>>(new Set());

    async function handleSearch(formData: FormData) {
        setLoading(true);
        setResults([]);
        try {
            const sources = await discoverSources(formData);
            setResults(sources);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleAdd(source: DiscoveredSource) {
        const formData = new FormData();
        formData.append('name', source.name);
        formData.append('url', source.url);

        await addSource(formData);
        setAddedUrls(prev => new Set(prev).add(source.url));
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-light mb-2">Source Discovery</h1>
                        <p className="text-muted-foreground">Find event hubs for a specific city.</p>
                    </div>
                    <Link href="/admin/events" className="text-sm text-muted-foreground hover:text-foreground">
                        &larr; Back to Events
                    </Link>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
                    <form action={handleSearch} className="flex gap-4">
                        <div className="relative flex-1">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input
                                name="location"
                                placeholder="Enter City, State (e.g. Melbourne, FL)"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                            Discover
                        </button>
                    </form>
                </div>

                {results.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-medium mb-4">Found {results.length} Potential Sources</h2>
                        <div className="grid gap-4">
                            {results.map((source, i) => (
                                <div key={i} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between group hover:border-primary/50 transition-colors">
                                    <div className="flex-1 min-w-0 mr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium truncate">{source.name}</h3>
                                            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full">
                                                {source.type}
                                            </span>
                                        </div>
                                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline truncate block">
                                            {source.url}
                                        </a>
                                    </div>
                                    <button
                                        onClick={() => handleAdd(source)}
                                        disabled={addedUrls.has(source.url)}
                                        className={`p-2 rounded-full transition-colors ${addedUrls.has(source.url)
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                : 'bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground'
                                            }`}
                                    >
                                        {addedUrls.has(source.url) ? <Check size={20} /> : <Plus size={20} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
