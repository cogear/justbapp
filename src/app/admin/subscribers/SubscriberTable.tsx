'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Mail, Calendar, CheckCircle2, XCircle, MapPin, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { toggleSubscriberEmailStatus, bulkDisableSubscribers } from './actions';
import type { Subscriber } from './actions';

interface SubscriberTableProps {
    subscribers: Subscriber[];
}

export function SubscriberTable({ subscribers }: SubscriberTableProps) {
    const router = useRouter();
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [isDisabling, setIsDisabling] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const allSelected = subscribers.length > 0 && selected.size === subscribers.length;

    function toggleAll() {
        if (allSelected) {
            setSelected(new Set());
        } else {
            setSelected(new Set(subscribers.map(s => s.id)));
        }
    }

    function toggleOne(id: string) {
        const next = new Set(selected);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelected(next);
    }

    async function handleBulkDisable() {
        const ids = Array.from(selected);
        setIsDisabling(true);
        const result = await bulkDisableSubscribers(ids);
        setIsDisabling(false);

        if (result.success) {
            toast.success(`Disabled ${result.count} subscriber${result.count === 1 ? '' : 's'}`);
            setSelected(new Set());
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to disable subscribers');
        }
    }

    async function handleToggle(userId: string, currentStatus: boolean, email: string) {
        setTogglingId(userId);
        const result = await toggleSubscriberEmailStatus(userId, currentStatus);
        setTogglingId(null);

        if (result.success) {
            toast.success(`${currentStatus ? 'Disabled' : 'Enabled'} emails for ${email}`);
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to update status');
        }
    }

    return (
        <>
            {selected.size > 0 && (
                <div className="mb-4 flex items-center gap-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">
                        {selected.size} selected
                    </span>
                    <button
                        onClick={handleBulkDisable}
                        disabled={isDisabling}
                        className="px-4 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                        <Ban size={14} />
                        {isDisabling ? 'Disabling...' : 'Disable Selected'}
                    </button>
                </div>
            )}

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 border-b border-border sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleAll}
                                        className="rounded border-border"
                                    />
                                </th>
                                <th className="p-4 font-medium text-muted-foreground">Email</th>
                                <th className="p-4 font-medium text-muted-foreground">Join Date</th>
                                <th className="p-4 font-medium text-muted-foreground">Source</th>
                                <th className="p-4 font-medium text-muted-foreground">Opted In</th>
                                <th className="p-4 font-medium text-muted-foreground">Location</th>
                                <th className="p-4 font-medium text-muted-foreground">Email Status</th>
                                <th className="p-4 font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {subscribers.map((sub) => (
                                <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selected.has(sub.id)}
                                            onChange={() => toggleOne(sub.id)}
                                            className="rounded border-border"
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 font-medium">
                                            <Mail size={14} className="text-muted-foreground" />
                                            {sub.email}
                                        </div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-muted-foreground" />
                                            {format(sub.createdAt, 'MMM d, yyyy')}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                            ${sub.source === 'APP'
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                                            {sub.source === 'APP' ? 'App User' : 'Newsletter'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {sub.optedIn ? (
                                            <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                                                <CheckCircle2 size={14} />
                                                <span className="text-xs font-medium">Yes</span>
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                                <XCircle size={14} />
                                                <span className="text-xs font-medium">No</span>
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            {sub.zipCode ? (
                                                <>
                                                    <MapPin size={14} />
                                                    {sub.zipCode}
                                                </>
                                            ) : (
                                                <span className="text-xs italic">Unknown</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            sub.emailActive && sub.optedIn
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                            }`}>
                                            {sub.emailActive && sub.optedIn ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleToggle(sub.id, sub.emailActive, sub.email)}
                                            disabled={togglingId === sub.id}
                                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${sub.emailActive
                                                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50'
                                                } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5`}
                                        >
                                            {sub.emailActive ? (
                                                <><Ban size={12} /> Disable</>
                                            ) : (
                                                <><CheckCircle size={12} /> Enable</>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {subscribers.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                                        No subscribers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
