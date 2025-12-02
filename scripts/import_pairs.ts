import fs from 'fs';
import path from 'path';

const jsonPath = path.join(process.cwd(), 'docs/50pairws.json');
const outPath = path.join(process.cwd(), 'src/lib/visual-profiler/data.ts');

interface RawPair {
    pair_id: string;
    layer: string;
    concept_A: string;
    concept_B: string;
    image_prompt_A: string;
    image_prompt_B: string;
    data_inference: string;
    branching_logic: string;
}

const rawData: RawPair[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

function mapLayer(l: string): 1 | 2 | 3 {
    if (l === 'Psychographic') return 1;
    if (l === 'Value') return 2;
    return 3;
}

function mapInference(inf: string): any {
    const lower = inf.toLowerCase();
    const traits: any = {};
    const iab: string[] = [];

    if (lower.includes('openness')) {
        traits.Openness = 0.8;
    } else if (lower.includes('conscientiousness')) {
        traits.Conscientiousness = 0.8;
    } else if (lower.includes('extraversion')) {
        traits.Extraversion = 0.8;
    } else if (lower.includes('agreeableness')) {
        traits.Agreeableness = 0.8;
    } else if (lower.includes('neuroticism')) {
        if (lower.includes('low')) {
            traits.Neuroticism = -0.8;
        } else {
            traits.Neuroticism = 0.8;
        }
    }

    // Basic Interest Mapping (very incomplete, but a start)
    if (lower.includes('golf')) iab.push('IAB17');
    if (lower.includes('basketball')) iab.push('IAB17');
    if (lower.includes('gaming')) iab.push('IAB9', 'IAB10'); // Hobbies, Home?
    if (lower.includes('music')) iab.push('IAB1');
    if (lower.includes('movie')) iab.push('IAB1');
    if (lower.includes('food') || lower.includes('dining')) iab.push('IAB8');
    if (lower.includes('travel')) iab.push('IAB20');
    if (lower.includes('tech') || lower.includes('coding')) iab.push('IAB19');
    if (lower.includes('fashion')) iab.push('IAB18');
    if (lower.includes('pet')) iab.push('IAB16');
    if (lower.includes('history')) iab.push('IAB5', 'IAB14');
    if (lower.includes('science') || lower.includes('space')) iab.push('IAB15');
    if (lower.includes('business') || lower.includes('startup')) iab.push('IAB3');

    return { traits, iab };
}

const pairs = rawData.map(p => {
    const inferenceA = mapInference(p.data_inference);
    // Invert traits for B (simplified)
    const inferenceB = {
        traits: Object.fromEntries(Object.entries(inferenceA.traits).map(([k, v]) => [k, (v as number) * -1])),
        iab: [] // Hard to infer opposite interest IAB without specific logic
    };

    return {
        id: p.pair_id,
        layer: mapLayer(p.layer),
        theme: `${p.concept_A} vs ${p.concept_B}`,
        imageA: {
            src: `/images/visual-profiler/${p.pair_id.toLowerCase()}_a.png`,
            alt: p.concept_A,
            prompt: p.image_prompt_A, // Keeping prompt for generation script
            inference: inferenceA
        },
        imageB: {
            src: `/images/visual-profiler/${p.pair_id.toLowerCase()}_b.png`,
            alt: p.concept_B,
            prompt: p.image_prompt_B,
            inference: inferenceB
        }
    };
});

const fileContent = `import { ImagePair } from './types';

export const PAIRS: ImagePair[] = ${JSON.stringify(pairs, null, 2)};

export const IAB_LABELS: Record<string, string> = {
  'IAB1': 'Arts & Entertainment',
  'IAB2': 'Automotive',
  'IAB3': 'Business',
  'IAB4': 'Careers',
  'IAB5': 'Education',
  'IAB6': 'Family & Parenting',
  'IAB7': 'Health & Fitness',
  'IAB8': 'Food & Drink',
  'IAB9': 'Hobbies & Interests',
  'IAB10': 'Home & Garden',
  'IAB11': 'Law, Gov, & Politics',
  'IAB12': 'News',
  'IAB13': 'Personal Finance',
  'IAB14': 'Society',
  'IAB15': 'Science',
  'IAB16': 'Pets',
  'IAB17': 'Sports',
  'IAB18': 'Style & Fashion',
  'IAB19': 'Technology & Computing',
  'IAB20': 'Travel',
  'IAB21': 'Real Estate',
  'IAB22': 'Shopping',
  'IAB23': 'Religion & Spirituality',
};
`;

fs.writeFileSync(outPath, fileContent);
console.log(`Generated ${pairs.length} pairs to ${outPath}`);
