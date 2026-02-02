import { Button } from "@/components/ui/button"
import { PlayCircle, CheckCircle } from "lucide-react"

export function CourseView({ spaceId }: { spaceId: string }) {
    return (
        <div className="flex h-[calc(100vh-64px)]">
            {/* Main Content (Video/Text) */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="aspect-video bg-muted rounded-lg mb-8 overflow-hidden">
                    <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/MMPN2MGEPLU?si=yNLNcFOgsU3DQPJl"
                        title="Introduction to Just Be"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                    ></iframe>
                </div>
                <h1 className="text-3xl font-bold mb-4">Introduction to Just Be</h1>
                <p className="text-lg text-muted-foreground">
                    Welcome to the course. This is where the lesson content will go.
                </p>
            </div>

            {/* Curriculum Sidebar */}
            <div className="w-80 border-l bg-muted/10 overflow-y-auto">
                <div className="p-4 border-b font-medium">Course Curriculum</div>
                <div className="p-4 space-y-4">
                    <div>
                        <div className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Module 1: Basics</div>
                        <div className="space-y-1">
                            <Button variant="ghost" className="w-full justify-start text-sm">
                                <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                                Welcome
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-sm">
                                <PlayCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                                The Philosophy
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
