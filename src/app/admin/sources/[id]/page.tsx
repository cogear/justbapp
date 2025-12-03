import prisma from '@/lib/prisma';
import { updateSource } from '../actions';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function EditSourcePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const source = await prisma.eventSource.findUnique({
        where: { id },
    });

    if (!source) {
        redirect('/admin/sources');
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-8 font-sans">
            <div className="max-w-xl mx-auto">
                <div className="mb-8">
                    <Link href="/admin/sources" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
                        <ArrowLeft size={16} /> Back to Sources
                    </Link>
                    <h1 className="text-3xl font-light mb-2">Edit Source</h1>
                    <p className="text-muted-foreground">Update the source details.</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <form action={updateSource} className="space-y-4">
                        <input type="hidden" name="id" value={source.id} />
                        <div>
                            <label className="block text-sm font-medium mb-1">Source Name</label>
                            <input
                                name="name"
                                defaultValue={source.name}
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
                                defaultValue={source.url}
                                placeholder="https://..."
                                required
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 flex items-center justify-center gap-2 mt-4"
                        >
                            <Save size={18} />
                            Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
