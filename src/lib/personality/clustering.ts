export interface OceanScores {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
}

export interface PersonalityCluster {
    id: string;
    name: string;
    description: string;
    centroid: OceanScores;
}

// Centroids based on research descriptions (approximate 0-100 scale)
// O, C, E, A, N
export const CLUSTERS: PersonalityCluster[] = [
    {
        id: 'average',
        name: 'Balanced',
        description: 'Socially typical, a bit stress-sensitive, and pragmatic. The most common profile.',
        centroid: { openness: 40, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 70 }
    },
    {
        id: 'reserved',
        name: 'Reserved',
        description: 'Quiet, cautious, emotionally steady, and dependable. The calm friend everyone trusts.',
        centroid: { openness: 30, conscientiousness: 65, extraversion: 30, agreeableness: 65, neuroticism: 30 }
    },
    {
        id: 'self-centered',
        name: 'Ego-Resilient', // Using the nicer name
        description: 'Socially bold, impulsive, and attention-seeking. Often prioritizes own needs.',
        centroid: { openness: 50, conscientiousness: 30, extraversion: 80, agreeableness: 30, neuroticism: 70 }
    },
    {
        id: 'role-model',
        name: 'Role Model',
        description: 'Emotionally stable, curious, prosocial, and high-functioning. Natural leaders.',
        centroid: { openness: 75, conscientiousness: 80, extraversion: 60, agreeableness: 80, neuroticism: 20 }
    },
    {
        id: 'methodical',
        name: 'Methodical Introvert',
        description: 'Structured, self-disciplined, and reliable. "I don\'t make noise, I make progress."',
        centroid: { openness: 50, conscientiousness: 85, extraversion: 30, agreeableness: 50, neuroticism: 30 }
    },
    {
        id: 'explorer',
        name: 'Explorer',
        description: 'Idea-driven, curious, and experimental. "I\'ll invent a rocket. The spreadsheet can wait."',
        centroid: { openness: 85, conscientiousness: 40, extraversion: 60, agreeableness: 60, neuroticism: 50 }
    }
];

export function assignPersonalityCluster(scores: OceanScores): PersonalityCluster {
    let closestCluster = CLUSTERS[0];
    let minDistance = Infinity;

    for (const cluster of CLUSTERS) {
        const distance = calculateDistance(scores, cluster.centroid);
        if (distance < minDistance) {
            minDistance = distance;
            closestCluster = cluster;
        }
    }

    return closestCluster;
}

function calculateDistance(a: OceanScores, b: OceanScores): number {
    return Math.sqrt(
        Math.pow(a.openness - b.openness, 2) +
        Math.pow(a.conscientiousness - b.conscientiousness, 2) +
        Math.pow(a.extraversion - b.extraversion, 2) +
        Math.pow(a.agreeableness - b.agreeableness, 2) +
        Math.pow(a.neuroticism - b.neuroticism, 2)
    );
}
