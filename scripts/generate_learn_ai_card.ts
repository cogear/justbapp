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

const OUT_DIR = path.join(process.cwd(), 'public/images/hero-candidates-learn-ai');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const SHARED_STYLE =
    'Photorealistic, editorial magazine quality, 35mm film aesthetic, soft natural light, ' +
    'gentle film grain, shallow depth of field, muted warm earth tones — sand, sage green, ' +
    'warm clay, soft mist gray. No one looking directly at the camera. Candid, intimate, ' +
    'unhurried mood. Avoid neon, saturated colors, polished stock-photo aesthetics. ' +
    'No white borders, no frame, full bleed photograph.';

const VARIANTS = [
    {
        slug: '01-table-laptop',
        prompt:
            'Two friends in their late twenties at a sunlit kitchen table, an open laptop between ' +
            'them showing a soft glow on their faces, mugs of tea in hand, one leaning in pointing ' +
            'gently at the screen while the other listens with a small smile and an open notebook. ' +
            'Plants and bookshelves softly out of focus behind them. Warm morning light from a tall ' +
            'window. Linen and knitwear in sage and clay tones. ' +
            SHARED_STYLE,
    },
    {
        slug: '02-couch-learning',
        prompt:
            'Three diverse friends in their late twenties on a worn linen couch in a softly lit ' +
            'living room, a laptop on the wooden coffee table in front of them, one pointing at ' +
            'the screen while the others lean in, mugs of tea, an open notebook, plants and ' +
            'stacked books in the background, warm afternoon side light. Sage and clay-toned ' +
            'clothes, relaxed and curious mood, like a small study group at home. ' +
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
