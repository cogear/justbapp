export type Trait = 'Openness' | 'Conscientiousness' | 'Extraversion' | 'Agreeableness' | 'Neuroticism';

export interface TraitScore {
    trait: Trait;
    score: number; // -1.0 to 1.0 (standard deviations)
}

export interface IABCategory {
    id: string;
    name: string;
    weight: number; // Probability/Affinity score
}

export interface Inference {
    traits: Partial<Record<Trait, number>>; // e.g., { Openness: 0.8, Conscientiousness: -0.2 }
    iab?: string[]; // List of IAB category IDs implied by this choice
}

export interface ImageConfig {
    src: string;
    alt: string;
    prompt?: string;
    inference: Inference;
}

export interface ImagePair {
    id: string;
    layer: 1 | 2 | 3;
    theme: string;
    imageA: ImageConfig;
    imageB: ImageConfig;
}

export interface UserProfile {
    traits: Record<Trait, number>;
    iabInterests: IABCategory[];
}

export interface Choice {
    pairId: string;
    choice: 'A' | 'B';
}
