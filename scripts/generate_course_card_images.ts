import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

// Card header images for the community portal (PortalCard renders
// Space.imageUrl at aspect 5:2 on lg/md cards). Same seedream-v4 pipeline and
// quiet house style as generate_community_backdrops.ts: soft focus, muted
// palette, no people in focus, never any text.

const API_KEY = process.env.WAVESPEED_API_KEY;
const API_URL = 'https://api.wavespeed.ai/api/v3/bytedance/seedream-v4';
if (!API_KEY) { console.error('Missing WAVESPEED_API_KEY'); process.exit(1); }

const OUT_DIR = path.join(process.cwd(), 'public/images/community/cards');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const STYLE =
    ' Photorealistic, 35mm film aesthetic, gentle grain, extreme shallow depth of field, ' +
    'soft natural light, muted warm earth palette — sand, sage, warm clay, cream. ' +
    'No people, no faces, no animals, no text, no logos, no busy detail. Calm and unhurried.';

const CARDS: { slug: string; prompt: string }[] = [
    {
        slug: 'ai-for-humans',
        prompt: 'Soft-focus photograph of a warm morning desk by a window: a closed linen-covered notebook, reading glasses, a mug with faint steam, pale sunlight across wood grain, generous negative space.' + STYLE,
    },
    {
        slug: 'living-with-ai',
        prompt: 'Soft-focus photograph of a calm evening living room corner: a low warm lamp, an armchair with a folded throw, a small side table with a closed book, dusk light in the window.' + STYLE,
    },
    {
        slug: 'the-quiet-crafts',
        prompt: 'Soft-focus still life of undyed wool yarn balls and wooden knitting needles resting on rumpled natural linen, morning window light raking across the fibers, generous negative space.' + STYLE,
    },
    {
        slug: 'third-places',
        prompt: 'Soft-focus photograph of an empty neighborhood cafe counter at golden hour: worn wooden stools, a ceramic cup with steam, warm light through the front window, street softly blurred beyond.' + STYLE,
    },
    {
        slug: 'private-invite-meetups',
        prompt: 'Soft-focus photograph of a small dinner table set for four in a warm kitchen at evening: mismatched plates, a lit taper candle, a pot on a trivet, warm lamplight, everything gentle and imperfect.' + STYLE,
    },
    {
        slug: 'the-comfortable-life',
        prompt: 'Soft-focus photograph of a cozy reading corner at dusk: one warm lamp glowing, a wool blanket over a chair arm, a mug on a windowsill, deep blue evening light outside the glass.' + STYLE,
    },
];

async function generate(card: { slug: string; prompt: string }) {
    const filePath = path.join(OUT_DIR, `${card.slug}.png`);
    if (fs.existsSync(filePath)) { console.log(`[${card.slug}] exists, skipping`); return; }
    console.log(`[${card.slug}] starting`);
    const startRes = await fetch(API_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: card.prompt, output_format: 'png', size: '2000*800' }),
    });
    if (!startRes.ok) { console.error(`[${card.slug}] start failed: ${startRes.status}`, await startRes.text()); return; }
    const initial = await startRes.json();
    const pollUrl = initial?.data?.urls?.get;
    if (!pollUrl) { console.error(`[${card.slug}] no poll URL`); return; }
    for (let attempt = 0; attempt < 150; attempt++) {
        await new Promise(r => setTimeout(r, 2000));
        const pollRes = await fetch(pollUrl, { headers: { Authorization: `Bearer ${API_KEY}` } });
        if (!pollRes.ok) continue;
        const data = await pollRes.json();
        const status = data?.data?.status ?? data?.status;
        if (status === 'succeeded' || status === 'completed') {
            const outputs = data?.data?.outputs;
            const imageUrl = Array.isArray(outputs) && outputs.length > 0
                ? (typeof outputs[0] === 'string' ? outputs[0] : outputs[0]?.url)
                : data?.data?.url;
            if (!imageUrl) { console.error(`[${card.slug}] success but no URL`); return; }
            const buf = await (await fetch(imageUrl)).arrayBuffer();
            fs.writeFileSync(filePath, Buffer.from(buf));
            console.log(`[${card.slug}] saved`);
            return;
        }
        if (status === 'failed' || status === 'canceled') { console.error(`[${card.slug}] failed`, data?.data?.error ?? data?.error); return; }
    }
    console.error(`[${card.slug}] timed out`);
}

async function main() {
    for (const card of CARDS) await generate(card);
    console.log('Done.');
}

main().catch(console.error);
