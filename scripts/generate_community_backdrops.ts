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

const OUT_DIR = path.join(process.cwd(), 'public/images/community');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// These are full-viewport BACKDROPS behind text and cards: they must stay
// quiet — soft focus, no focal subject, generous negative space.
const VARIANTS = [
    {
        slug: 'meadow-day',
        prompt:
            'Dreamy soft-focus background photograph of a sunlit summer meadow, view across pale golden ' +
            'grass and a few out-of-focus dandelion seed heads, gentle morning haze, high-key warm light, ' +
            'large areas of soft empty sky in warm cream and pale sage tones, everything slightly blurred ' +
            'as if seen through a dream, no people, no animals, no sharp subject, extreme shallow depth of ' +
            'field, muted warm earth palette — sand, sage green, warm clay, mist gray. Photorealistic, ' +
            '35mm film aesthetic, gentle grain. Calm, unhurried, meditative. Avoid saturated color, ' +
            'avoid busy detail, avoid any text.',
    },
    {
        slug: 'meadow-dusk',
        prompt:
            'Dreamy soft-focus background photograph of a meadow at late dusk beside a dark forest edge, ' +
            'deep blue-green twilight fading to near-dark, silhouettes of soft grass in the foreground ' +
            'completely out of focus, faint warm glow remaining on the horizon, large areas of calm dark ' +
            'sky, no people, no animals, no sharp subject, no visible light sources, extreme shallow depth ' +
            'of field, muted palette — deep night blue, dark sage, charcoal, a whisper of warm clay at the ' +
            'horizon. Photorealistic, 35mm film aesthetic, gentle grain. Quiet, safe, midsummer-evening ' +
            'mood. Dark enough that white text would be readable over most of the frame. Avoid saturated ' +
            'color, avoid busy detail, avoid any text.',
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
        console.error(`[${variant.slug}] no poll URL`, JSON.stringify(initial).slice(0, 300));
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
                console.error(`[${variant.slug}] success but no URL`);
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
