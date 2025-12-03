'use client';

import { addSource } from '../actions';
import { Loader2, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewSourcePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            await addSource(formData);
            router.push('/admin/sources');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-8 font-sans">
            <div className="max-w-xl mx-auto">
                <div className="mb-8">
                    <Link href="/admin/sources" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
                        <ArrowLeft size={16} /> Back to Sources
                    </Link>
                    <h1 className="text-3xl font-light mb-2">Add Source Manually</h1>
                    <p className="text-muted-foreground">Add a specific URL to scrape events from.</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <form action={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Source Name</label>
                            <input
                                name="name"
                                placeholder="e.g. Melbourne Public Library"
                                required
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Events URL</label>
                            <input
                                name="url"
                                type="url"
                                placeholder="https://..."
                                required
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                The URL should point to a page listing events (calendar, list, etc).
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                            Add Source
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
