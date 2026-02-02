import { CommunitySidebar } from '@/components/community-sidebar';

export default function CommunityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <CommunitySidebar />
            <main className="flex-1 overflow-y-auto">
                {/* Mobile Header would go here */}
                {children}
            </main>
        </div>
    );
}
