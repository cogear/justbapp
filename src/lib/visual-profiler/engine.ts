import { Choice, ImagePair, Trait, TraitScore, UserProfile, IABCategory } from './types';
import { IAB_LABELS } from './data';

const TRAIT_RANGES: Record<Trait, { min: number; max: number }> = {
    Openness: { min: -1.3, max: 9.5 },
    Conscientiousness: { min: -2.7, max: 11.0 },
    Extraversion: { min: -3.4, max: 6.7 },
    Agreeableness: { min: -2.3, max: 4.7 },
    Neuroticism: { min: -3.3, max: 2.3 }
};

export function calculateProfile(choices: Choice[], pairs: ImagePair[]): UserProfile {
    const traits: Record<Trait, number> = {
        Openness: 0,
        Conscientiousness: 0,
        Extraversion: 0,
        Agreeableness: 0,
        Neuroticism: 0
    };

    const iabCounts: Record<string, number> = {};

    choices.forEach(choice => {
        const pair = pairs.find(p => p.id === choice.pairId);
        if (!pair) return;

        const selectedImage = choice.choice === 'A' ? pair.imageA : pair.imageB;
        const inference = selectedImage.inference;

        // Update Traits
        if (inference.traits) {
            Object.entries(inference.traits).forEach(([trait, score]) => {
                if (traits[trait as Trait] !== undefined) {
                    traits[trait as Trait] += score;
                }
            });
        }

        // Update IAB Interests
        if (inference.iab) {
            inference.iab.forEach(iabId => {
                iabCounts[iabId] = (iabCounts[iabId] || 0) + 1;
            });
        }
    });

    // Normalize Traits to 0-100%
    // Using piecewise linear mapping: Min -> 0%, 0 -> 50%, Max -> 100%
    // This handles skewed ranges (e.g. Conscientiousness -2.7 to 11.0) while keeping 0 as neutral.
    Object.keys(traits).forEach(key => {
        const k = key as Trait;
        const rawScore = traits[k];
        const range = TRAIT_RANGES[k];

        let percentage = 50;
        if (rawScore > 0) {
            percentage = 50 + (rawScore / range.max) * 50;
        } else if (rawScore < 0) {
            percentage = 50 - (Math.abs(rawScore) / Math.abs(range.min)) * 50;
        }

        // Clamp to 0-100 just in case floating point weirdness
        traits[k] = Math.max(0, Math.min(100, Math.round(percentage)));
    });

    // Sort and format IAB interests
    const iabInterests: IABCategory[] = Object.entries(iabCounts)
        .map(([id, count]) => ({
            id,
            name: IAB_LABELS[id] || id,
            weight: count
        }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 5); // Top 5 interests

    return {
        traits,
        iabInterests
    };
}

export function getNextPair(currentPairId: string | null, choices: Choice[], pairs: ImagePair[]): ImagePair | null {
    if (!currentPairId) return pairs[0];

    const currentIndex = pairs.findIndex(p => p.id === currentPairId);
    if (currentIndex === -1 || currentIndex === pairs.length - 1) return null;

    // Simple linear flow for now as per the imported dataset structure (it has branching logic strings but we aren't parsing them fully yet)
    // The dataset has "Next: L2_..." strings. We could parse that.

    // Let's try to parse the branching logic from the current pair if possible.
    // But since we didn't store the raw "branching_logic" string in our clean `ImagePair` type in `data.ts` (we only have what `import_pairs.ts` kept),
    // we might need to rely on linear order or update `types.ts` and `import_pairs.ts` to include it.

    // Checking `types.ts`... `ImagePair` does NOT have `branchingLogic`.
    // Checking `import_pairs.ts`... it does NOT map `branching_logic`.

    // For MVP, linear is fine. The dataset is roughly ordered L1 -> L2 -> L3.
    return pairs[currentIndex + 1];
}
