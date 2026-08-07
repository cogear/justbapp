import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
    title: "Seven Principles of Intentional Living",
    description: "Explore the seven core principles of The b. Life: Acceptance Not Settling, Comfort as Achievement, Quality Over Status, Slow Down Intentionally, Balance Over Burnout, Community Not Competition, and Gratitude and Small Joys.",
    path: "/principles",
    image: { url: "/images/principles/acceptance.png" },
});

export default function PrinciplesLayout({ children }: { children: React.ReactNode }) {
    return children;
}
