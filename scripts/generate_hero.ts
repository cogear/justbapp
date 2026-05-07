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

const OUT_DIR = path.join(process.cwd(), 'public/images/hero-candidates');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const SHARED_STYLE =
    'Photorealistic, editorial magazine quality, 35mm film aesthetic, soft natural light, ' +
    'gentle film grain, shallow depth of field, muted warm earth tones — sand, sage green, ' +
    'warm clay, soft mist gray. No one looking directly at the camera. Candid, intimate, ' +
    'unhurried mood. Avoid neon, saturated colors, and overly polished stock-photo aesthetics.';

const VARIANTS = [
    {
        slug: '01-porch-table',
        prompt:
            'A small candid group of four diverse friends in their late twenties around a wooden farmhouse table, ' +
            'ceramic mugs of tea in hand, mid-conversation, warm golden-hour light streaming through a window, ' +
            'soft natural shadows on faces and table. ' +
            SHARED_STYLE,
    },
    {
        slug: '02-meadow-circle',
        prompt:
            'Three young adults in their late twenties sitting cross-legged on a soft wool rug on grass in a meadow, ' +
            'all looking inward at each other in calm conversation, soft afternoon daylight, ' +
            'wildflowers at the edges of the frame. ' +
            SHARED_STYLE,
    },
    {
        slug: '03-walking-path',
        prompt:
            'Three young adults walking together down a tree-lined path in late afternoon, photographed from behind ' +
            'and three-quarters so faces are partially turned, autumnal warm light, leaves in soft focus, ' +
            'a candid intimate moment of friendship. ' +
            SHARED_STYLE,
    },
    {
        slug: '04-kitchen-cooking',
        prompt:
            'Four diverse young adults in their late twenties cooking and plating a meal together in a sunlit ' +
            'kitchen with worn wooden counters and ceramic bowls, hands and movement in focus, faces partially ' +
            'turned, relaxed candid mood, warm natural light from a tall window. ' +
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
            size: '2048*1152',
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
        if (!pollRes.ok) {
            console.error(`[${variant.slug}] poll ${attempt} failed: ${pollRes.status}`);
            continue;
        }
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
