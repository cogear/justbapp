import { stackServerApp } from "@/lib/stack";
import { StackHandler } from "@stackframe/stack";

export default function Page() {
    return <StackHandler app={stackServerApp} fullPage={true} />;
}
