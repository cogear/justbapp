import Link from 'next/link';
import { ArrowLeft, ChevronRight, Eye, Video } from 'lucide-react';
import { getCoursesWithLessons } from './actions';
import { LessonVideoForm } from '@/components/admin/lesson-video-form';

export default async function AdminCoursesPage() {
    const courses = await getCoursesWithLessons();

    const totalLessons = courses.reduce(
        (sum, c) => sum + c.modules.reduce((s, m) => s + m.lessons.length, 0),
        0
    );
    const lessonsWithVideo = courses.reduce(
        (sum, c) => sum + c.modules.reduce(
            (s, m) => s + m.lessons.filter(l => !!l.videoUrl).length, 0
        ), 0
    );
    const totalViews = courses.reduce(
        (sum, c) => sum + c.modules.reduce(
            (s, m) => s + m.lessons.reduce((ls, l) => ls + l.viewCount, 0), 0
        ), 0
    );

    return (
        <div className="min-h-screen bg-background text-foreground p-8 font-sans">
            <div className="max-w-5xl mx-auto">
                <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                    <ArrowLeft size={14} />
                    Admin
                </Link>

                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-georgia mb-1">Course Videos</h1>
                        <p className="text-sm text-muted-foreground">
                            Attach a YouTube URL to any article. {lessonsWithVideo} of {totalLessons} have a video. {totalViews.toLocaleString()} total views.
                        </p>
                    </div>
                </div>

                {courses.length === 0 && (
                    <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                        No courses found. Run <code className="px-1.5 py-0.5 bg-muted rounded text-xs">npm run seed:courses</code> first.
                    </div>
                )}

                <div className="space-y-10">
                    {courses.map(course => {
                        const courseTotal = course.modules.reduce((s, m) => s + m.lessons.length, 0);
                        const courseWithVideo = course.modules.reduce(
                            (s, m) => s + m.lessons.filter(l => !!l.videoUrl).length, 0
                        );
                        const courseViews = course.modules.reduce(
                            (s, m) => s + m.lessons.reduce((ls, l) => ls + l.viewCount, 0), 0
                        );

                        return (
                            <section key={course.id}>
                                <header className="flex items-baseline justify-between mb-4 pb-2 border-b border-border gap-4">
                                    <h2 className="text-xl font-georgia">{course.title}</h2>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground tracking-wide uppercase whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1">
                                            <Eye size={12} />
                                            {courseViews.toLocaleString()}
                                        </span>
                                        <span>{courseWithVideo} / {courseTotal} with video</span>
                                    </div>
                                </header>

                                <div className="space-y-3">
                                    {course.modules.map(mod => {
                                        const moduleViews = mod.lessons.reduce((s, l) => s + l.viewCount, 0);
                                        const moduleWithVideo = mod.lessons.filter(l => !!l.videoUrl).length;

                                        return (
                                            <details key={mod.id} className="group bg-card border border-border rounded-xl overflow-hidden">
                                                <summary className="px-4 py-3 bg-muted/40 border-b border-transparent group-open:border-border flex items-center gap-2 cursor-pointer hover:bg-muted/60 transition-colors list-none [&::-webkit-details-marker]:hidden">
                                                    <ChevronRight size={14} className="text-muted-foreground transition-transform group-open:rotate-90 shrink-0" />
                                                    <Video size={14} className="text-muted-foreground shrink-0" />
                                                    <h3 className="text-sm font-medium truncate">
                                                        {mod.order}. {mod.title}
                                                    </h3>
                                                    <div className="flex items-center gap-3 ml-auto text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-1" title={`${moduleViews} views`}>
                                                            <Eye size={12} />
                                                            {moduleViews.toLocaleString()}
                                                        </span>
                                                        <span>{moduleWithVideo} / {mod.lessons.length}</span>
                                                    </div>
                                                </summary>

                                                <div className="divide-y divide-border">
                                                    {mod.lessons.map(lesson => (
                                                        <LessonVideoForm
                                                            key={lesson.id}
                                                            lessonId={lesson.id}
                                                            title={lesson.title}
                                                            initialVideoUrl={lesson.videoUrl}
                                                            courseSlug={course.spaceSlug}
                                                            moduleSlug={mod.slug}
                                                            lessonSlug={lesson.slug}
                                                            viewCount={lesson.viewCount}
                                                        />
                                                    ))}
                                                </div>
                                            </details>
                                        );
                                    })}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
