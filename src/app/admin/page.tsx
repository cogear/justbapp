import React from 'react';
import Link from 'next/link';
import { Mail, Newspaper, Users, Calendar } from 'lucide-react';

export default function AdminDashboard() {
    const adminTools = [
        {
            title: 'Newsletter Manager',
            description: 'Preview and send the daily essence newsletter.',
            href: '/admin/newsletter',
            icon: Mail,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            title: 'News Manager',
            description: 'Manage synced news articles and cluster reframing.',
            href: '/admin/news',
            icon: Newspaper,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            title: 'Subscriber List',
            description: 'View and manage newsletter subscribers.',
            href: '/admin/subscribers',
            icon: Users,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
        },
        {
            title: 'Event Manager',
            description: 'Manage community events and discovery.',
            href: '/admin/events',
            icon: Calendar,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
        },
    ];

    return (
        <main className="min-h-screen bg-[#FDFCFB] dark:bg-[#0A0A0A] py-16 px-6">
            <div className="max-w-4xl mx-auto">
                <header className="mb-16">
                    <h1 className="text-4xl font-dynapuff text-primary mb-4">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Select a tool to manage the Just Be ecosystem.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {adminTools.map((tool) => (
                        <Link
                            key={tool.href}
                            href={tool.href}
                            className="group block p-8 bg-white dark:bg-card border border-border/40 rounded-[32px] shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <div className="flex items-start gap-6">
                                <div className={`p-4 rounded-2xl ${tool.bgColor} ${tool.color} group-hover:scale-110 transition-transform duration-300`}>
                                    <tool.icon size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{tool.title}</h2>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
