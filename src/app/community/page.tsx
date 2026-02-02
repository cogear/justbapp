import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function CommunityPage() {
    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Community Dashboard</h1>
                <p className="text-muted-foreground mt-2">Welcome to the Just Be community.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Latest Activity</CardTitle>
                        <CardDescription>What's happening in your spaces</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">No recent activity.</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>My Courses</CardTitle>
                        <CardDescription>Continue where you left off</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">You are not enrolled in any courses.</div>
                    </CardContent>
                </Card>

                <Card className="bg-primary text-primary-foreground border-none">
                    <CardHeader>
                        <CardTitle>Foundations</CardTitle>
                        <CardDescription className="text-primary-foreground/80">Start your journey</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="secondary" className="w-full" asChild>
                            <Link href="/community/foundations">Go to Course</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
