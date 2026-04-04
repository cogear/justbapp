import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Seven Principles of Intentional Living",
    description: "Explore the seven core principles of The b. Life: Acceptance Not Settling, Comfort as Achievement, Quality Over Status, Slow Down Intentionally, Balance Over Burnout, Community Not Competition, and Gratitude and Small Joys.",
    openGraph: {
        title: "Seven Principles of Intentional Living | b. Just Be",
        description: "A philosophy for living well in the modern world, built on seven guiding principles.",
        images: [{ url: "/images/principles/acceptance.png" }],
    },
    alternates: { canonical: "https://theblife.com/principles" },
};

export default function PrinciplesLayout({ children }: { children: React.ReactNode }) {
    return children;
}
