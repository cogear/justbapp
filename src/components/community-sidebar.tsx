'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Home,
    BookOpen,
    MessageCircle,
    Settings,
    Plus,
    Hash
} from 'lucide-react';

interface Space {
    id: string;
    name: string;
    slug: string;
    type: 'FEED' | 'COURSE';
}

// Placeholder data - in real app this would come from props or a query
const MOCK_SPACES: Space[] = [
    { id: '1', name: 'General', slug: 'general', type: 'FEED' },
    { id: '2', name: 'Introductions', slug: 'introductions', type: 'FEED' },
    { id: '3', name: 'Just Be Foundations', slug: 'foundations', type: 'COURSE' },
];

export function CommunitySidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-sidebar border-r w-64 hidden md:flex">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold tracking-tight px-2">Community</h2>
            </div>

            <ScrollArea className="flex-1 py-4">
                <div className="px-3 space-y-4">

                    {/* Main Nav */}
                    <div className="space-y-1">
                        <Button
                            variant="ghost"
                            asChild
                            className={cn(
                                "w-full justify-start",
                                pathname === '/community' && "bg-accent/50"
                            )}
                        >
                            <Link href="/community">
                                <Home className="mr-2 h-4 w-4" />
                                Home
                            </Link>
                        </Button>
                    </div>

                    {/* Spaces */}
                    <div>
                        <div className="flex items-center justify-between px-2 mb-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Spaces</h3>
                        </div>
                        <div className="space-y-1">
                            {MOCK_SPACES.filter(s => s.type === 'FEED').map((space) => (
                                <Button
                                    key={space.id}
                                    variant="ghost"
                                    asChild
                                    className={cn(
                                        "w-full justify-start",
                                        pathname?.includes(`/community/${space.slug}`) && "bg-accent/50"
                                    )}
                                >
                                    <Link href={`/community/${space.slug}`}>
                                        <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {space.name}
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Courses */}
                    <div>
                        <div className="flex items-center justify-between px-2 mb-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Courses</h3>
                        </div>
                        <div className="space-y-1">
                            {MOCK_SPACES.filter(s => s.type === 'COURSE').map((space) => (
                                <Button
                                    key={space.id}
                                    variant="ghost"
                                    asChild
                                    className={cn(
                                        "w-full justify-start",
                                        pathname?.includes(`/community/${space.slug}`) && "bg-accent/50"
                                    )}
                                >
                                    <Link href={`/community/${space.slug}`}>
                                        <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {space.name}
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    </div>

                </div>
            </ScrollArea>

            <div className="p-4 border-t">
                <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                </Button>
            </div>
        </div>
    );
}
