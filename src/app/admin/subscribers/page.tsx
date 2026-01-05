import { getSubscribers } from './actions';
import { format } from 'date-fns';
import { Mail, Calendar, User, CheckCircle2, XCircle, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ToggleEmailButton } from './ToggleEmailButton';

export default async function AdminSubscribersPage() {
    const subscribers = await getSubscribers();

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
                        <p className="text-muted-foreground text-sm">{subscribers.length} total subscribers across app and newsletter</p>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 border-b border-border sticky top-0 z-10 backdrop-blur-sm">
                                <tr>
                                    <th className="p-4 font-medium text-muted-foreground">Email</th>
                                    <th className="p-4 font-medium text-muted-foreground">Join Date</th>
                                    <th className="p-4 font-medium text-muted-foreground">Source</th>
                                    <th className="p-4 font-medium text-muted-foreground">Profile Status</th>
                                    <th className="p-4 font-medium text-muted-foreground">Location</th>
                                    <th className="p-4 font-medium text-muted-foreground">Email Status</th>
                                    <th className="p-4 font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {subscribers.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
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
                                            <div className="flex items-center gap-2">
                                                {sub.hasProfile ? (
                                                    <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                                                        <CheckCircle2 size={14} />
                                                        <span className="text-xs font-medium">Completed</span>
                                                    </span>
                                                ) : sub.source === 'APP' ? (
                                                    <span className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-500">
                                                        <XCircle size={14} />
                                                        <span className="text-xs font-medium">Pending</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">N/A</span>
                                                )}
                                            </div>
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
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${sub.emailActive
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                }`}>
                                                {sub.emailActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <ToggleEmailButton
                                                userId={sub.id}
                                                currentStatus={sub.emailActive}
                                                userEmail={sub.email}
                                            />
                                        </td>
                                    </tr>
                                ))}
                                {subscribers.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                            No subscribers found yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
