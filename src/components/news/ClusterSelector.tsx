'use client';

import { CLUSTERS } from '@/lib/personality/clustering';
import { useRouter, useSearchParams } from 'next/navigation';

export function ClusterSelector({ currentCluster }: { currentCluster: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSelect = (clusterName: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('cluster', clusterName);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap gap-2 justify-center p-4 bg-muted/20 rounded-xl border border-border/50">
            <span className="text-sm font-medium text-muted-foreground self-center mr-2">
                Preview Lens:
            </span>
            {CLUSTERS.map((cluster) => (
                <button
                    key={cluster.name}
                    onClick={() => handleSelect(cluster.name)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${currentCluster === cluster.name
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50'
                        }`}
                >
                    {cluster.name}
                </button>
            ))}
        </div>
    );
}
