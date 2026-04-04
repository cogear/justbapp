'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Home,
    BookOpen,
    Settings,
    Hash,
    ChevronDown,
    ChevronRight,
    FileText,
} from 'lucide-react';

interface Lesson {
    id: string;
    title: string;
    order: number;
}

interface Module {
    id: string;
    title: string;
    order: number;
    lessons: Lesson[];
}

interface Space {
    id: string;
    name: string;
    slug: string;
    type: 'FEED' | 'COURSE';
    courses?: { id: string; modules: Module[] }[];
}

interface CommunitySidebarProps {
    spaces: Space[];
}

export function CommunitySidebar({ spaces }: CommunitySidebarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeLessonId = searchParams.get('lesson');

    const [expandedCourses, setExpandedCourses] = React.useState<Set<string>>(() => {
        // Auto-expand the active course
        const activeSlug = pathname?.split('/community/')?.[1]?.split('/')?.[0];
        const activeCourse = spaces.find(s => s.slug === activeSlug && s.type === 'COURSE');
        return activeCourse ? new Set([activeCourse.id]) : new Set();
    });

    const [expandedModules, setExpandedModules] = React.useState<Set<string>>(() => {
        // Auto-expand module containing active lesson
        if (!activeLessonId) return new Set();
        for (const space of spaces) {
            for (const course of space.courses || []) {
                for (const mod of course.modules) {
                    if (mod.lessons.some(l => l.id === activeLessonId)) {
                        return new Set([mod.id]);
                    }
                }
            }
        }
        return new Set();
    });

    function toggleCourse(spaceId: string) {
        setExpandedCourses(prev => {
            const next = new Set(prev);
            if (next.has(spaceId)) next.delete(spaceId);
            else next.add(spaceId);
            return next;
        });
    }

    function toggleModule(moduleId: string) {
        setExpandedModules(prev => {
            const next = new Set(prev);
            if (next.has(moduleId)) next.delete(moduleId);
            else next.add(moduleId);
            return next;
        });
    }

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

                    {/* Spaces (Feeds) */}
                    <div>
                        <div className="flex items-center justify-between px-2 mb-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Spaces</h3>
                        </div>
                        <div className="space-y-1">
                            {spaces.filter(s => s.type === 'FEED').map((space) => (
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

                    {/* Courses with expandable modules */}
                    <div>
                        <div className="flex items-center justify-between px-2 mb-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Courses</h3>
                        </div>
                        <div className="space-y-1">
                            {spaces.filter(s => s.type === 'COURSE').map((space) => {
                                const isActiveCourse = pathname?.includes(`/community/${space.slug}`);
                                const isCourseExpanded = expandedCourses.has(space.id);
                                const modules = space.courses?.[0]?.modules || [];

                                return (
                                    <div key={space.id}>
                                        <button
                                            onClick={() => toggleCourse(space.id)}
                                            className={cn(
                                                "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent/50",
                                                isActiveCourse && "bg-accent/50"
                                            )}
                                        >
                                            <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <span className="flex-1 text-left truncate">{space.name}</span>
                                            {isCourseExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </button>

                                        {isCourseExpanded && modules.length > 0 && (
                                            <div className="ml-3 mt-1 space-y-0.5">
                                                {modules.map(mod => {
                                                    const isModuleExpanded = expandedModules.has(mod.id);

                                                    return (
                                                        <div key={mod.id}>
                                                            <button
                                                                onClick={() => toggleModule(mod.id)}
                                                                className="w-full flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-accent/30 hover:text-foreground transition-colors"
                                                            >
                                                                {isModuleExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                                                <span className="flex-1 text-left truncate">{mod.title}</span>
                                                                <span className="text-[10px] opacity-60">{mod.lessons.length}</span>
                                                            </button>

                                                            {isModuleExpanded && (
                                                                <div className="ml-3 space-y-0.5 pb-1">
                                                                    {mod.lessons.map(lesson => {
                                                                        const isActive = activeLessonId === lesson.id;
                                                                        return (
                                                                            <Link
                                                                                key={lesson.id}
                                                                                href={`/community/${space.slug}?lesson=${lesson.id}`}
                                                                                className={cn(
                                                                                    "flex items-center gap-1.5 pl-4 pr-2 py-1 rounded-md text-xs transition-colors",
                                                                                    isActive
                                                                                        ? "bg-primary/10 text-foreground font-medium"
                                                                                        : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
                                                                                )}
                                                                            >
                                                                                <FileText size={11} className="shrink-0" />
                                                                                <span className="truncate">{lesson.title}</span>
                                                                            </Link>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
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
