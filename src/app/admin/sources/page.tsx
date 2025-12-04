import prisma from '@/lib/prisma';
import Link from 'next/link';
import { format } from 'date-fns';
import { Play, Trash2, Plus, ExternalLink, Search, Pencil } from 'lucide-react';
import { deleteSource, triggerScrape, runBatchScrape, runBatchDiscovery } from './actions';

export default async function AdminSourcesPage() {
    const sources = await prisma.eventSource.findMany({
        orderBy: { updatedAt: 'desc' },
    });

    return (
        <div className="min-h-screen bg-background text-foreground p-8 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-light mb-2">Source Manager</h1>
                        <p className="text-muted-foreground">Manage event hubs and trigger scraping.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/admin/events" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                            &larr; Back to Events
                        </Link>
                        <Link href="/admin/sources/new" className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:opacity-90 flex items-center gap-2">
                            <Plus size={16} /> Add Manually
                        </Link>
                        <Link href="/admin/sources/discover" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 flex items-center gap-2">
                            <Search size={16} /> Discover New
                        </Link>
                        <form action={runBatchDiscovery}>
                            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 flex items-center gap-2">
                                <Search size={16} /> Run Discovery
                            </button>
                        </form>
                        <form action={runBatchScrape}>
                            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center gap-2">
                                <Play size={16} /> Run Bot
                            </button>
                        </form>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="p-4 font-medium text-muted-foreground">Name</th>
                                <th className="p-4 font-medium text-muted-foreground">Status</th>
                                <th className="p-4 font-medium text-muted-foreground">Last Result</th>
                                <th className="p-4 font-medium text-muted-foreground">Last Scraped</th>
                                <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {sources.map((source) => (
                                <tr key={source.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-4 font-medium">
                                        <div>{source.name}</div>
                                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline flex items-center gap-1 mt-1">
                                            {source.url} <ExternalLink size={10} />
                                        </a>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${source.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            source.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {source.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {source.lastScrapeStatus && (
                                            <div className="flex flex-col">
                                                <span className={`text-xs font-medium ${source.lastScrapeStatus === 'SUCCESS' ? 'text-green-600 dark:text-green-400' :
                                                    'text-red-600 dark:text-red-400'
                                                    }`}>
                                                    {source.lastScrapeStatus}
                                                </span>
                                                {source.lastScrapeLog && (
                                                    <span className="text-[10px] text-muted-foreground max-w-[150px] truncate" title={source.lastScrapeLog}>
                                                        {source.lastScrapeLog}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-muted-foreground">
                                        {source.lastScrapedAt ? format(source.lastScrapedAt, 'MMM d, h:mm a') : 'Never'}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <form action={triggerScrape}>
                                                <input type="hidden" name="id" value={source.id} />
                                                <button type="submit" className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-md transition-colors" title="Scrape Now">
                                                    <Play size={16} />
                                                </button>
                                            </form>
                                            <Link href={`/admin/sources/${source.id}`} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors" title="Edit">
                                                <Pencil size={16} />
                                            </Link>
                                            <form action={deleteSource}>
                                                <input type="hidden" name="id" value={source.id} />
                                                <button type="submit" className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {sources.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                        No sources found. Use "Discover New" to find some!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
