import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const API_KEY = process.env.WAVESPEED_API_KEY;
const API_URL = 'https://api.wavespeed.ai/api/v3/bytedance/seedream-v4';

if (!API_KEY) {
    console.error('Missing WAVESPEED_API_KEY in .env.local');
    process.exit(1);
}

const OUT_DIR = path.join(process.cwd(), 'public/images/hero-candidates-living');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const SHARED_STYLE =
    'Photorealistic, editorial magazine quality, 35mm film aesthetic, soft natural light, ' +
    'gentle film grain, shallow depth of field, muted warm earth tones — sand, sage green, ' +
    'warm clay, soft mist gray. No one looking directly at the camera. Candid, intimate, ' +
    'unhurried mood. Avoid neon, saturated colors, polished stock-photo aesthetics. ' +
    'No white borders, no frame, full bleed photograph.';

const VARIANTS = [
    {
        slug: '01-table-hands',
        prompt:
            'A couple in their early thirties sitting at a worn wooden kitchen table in a sunlit ' +
            'home with bookshelves and houseplants in soft focus behind them. Their hands meet ' +
            'on the table top, foreheads almost touching, eyes closed in a quiet shared moment. ' +
            'Morning light from a tall window. Earthy linen and knitwear in sage and clay tones. ' +
            SHARED_STYLE,
    },
    {
        slug: '02-couch-reading',
        prompt:
            'Two people in their late twenties on a worn linen couch in a softly lit living room, ' +
            'one reading a hardcover book aloud while the other listens with eyes closed and a ' +
            'small smile, legs casually tangled, mug of tea on the side table, plants and a stack ' +
            'of books in the background, warm afternoon light. Sage and clay-toned clothes. ' +
            SHARED_STYLE,
    },
    {
        slug: '03-walking-path',
        prompt:
            'A couple in their early thirties walking together down a tree-lined path in late ' +
            'afternoon, photographed three-quarters from behind so faces are partially turned, ' +
            'hands almost touching, autumn leaves in soft focus, golden side light, an unhurried ' +
            'pace. Linen and wool in earthy tones. ' +
            SHARED_STYLE,
    },
];

async function generate(variant: { slug: string; prompt: string }) {
    const filePath = path.join(OUT_DIR, `${variant.slug}.png`);
    if (fs.existsSync(filePath)) {
        console.log(`[${variant.slug}] exists, skipping`);
        return;
    }

    console.log(`[${variant.slug}] starting`);

    const startRes = await fetch(API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: variant.prompt,
            output_format: 'png',
            size: '2048*896',
        }),
    });

    if (!startRes.ok) {
        console.error(`[${variant.slug}] start failed: ${startRes.status}`, await startRes.text());
        return;
    }

    const initial = await startRes.json();
    const pollUrl = initial?.data?.urls?.get;
    if (!pollUrl) {
        console.error(`[${variant.slug}] no poll URL in response`, JSON.stringify(initial).slice(0, 300));
        return;
    }

    for (let attempt = 0; attempt < 150; attempt++) {
        await new Promise(r => setTimeout(r, 2000));
        const pollRes = await fetch(pollUrl, {
            headers: { Authorization: `Bearer ${API_KEY}` },
        });
        if (!pollRes.ok) continue;
        const data = await pollRes.json();
        const status = data?.data?.status ?? data?.status;
        if (attempt % 5 === 0) console.log(`[${variant.slug}] poll ${attempt}: ${status}`);

        if (status === 'succeeded' || status === 'completed') {
            const outputs = data?.data?.outputs;
            const imageUrl =
                Array.isArray(outputs) && outputs.length > 0
                    ? typeof outputs[0] === 'string' ? outputs[0] : outputs[0]?.url
                    : data?.data?.url;
            if (!imageUrl) {
                console.error(`[${variant.slug}] success but no URL`, JSON.stringify(data).slice(0, 300));
                return;
            }
            const imgRes = await fetch(imageUrl);
            const buf = await imgRes.arrayBuffer();
            fs.writeFileSync(filePath, Buffer.from(buf));
            console.log(`[${variant.slug}] saved → ${path.relative(process.cwd(), filePath)}`);
            return;
        }
        if (status === 'failed' || status === 'canceled') {
            console.error(`[${variant.slug}] failed`, data?.data?.error ?? data?.error);
            return;
        }
    }

    console.error(`[${variant.slug}] timed out`);
}

async function main() {
    await Promise.all(VARIANTS.map(generate));
    console.log('Done.');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
