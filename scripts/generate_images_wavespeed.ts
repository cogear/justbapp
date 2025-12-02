import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { PAIRS } from '../src/lib/visual-profiler/data';

dotenv.config();

const API_KEY = process.env.WAVESPEED_API_KEY;
const API_URL = 'https://api.wavespeed.ai/api/v3/bytedance/seedream-v4'; // Guessing endpoint based on pattern
// Fallback or alternative if the above is wrong:
// const API_URL = 'https://api.wavespeed.ai/api/v3/wavespeed-ai/flux-dev-lora';

if (!API_KEY) {
    console.error('Missing WAVESPEED_API_KEY in .env');
    process.exit(1);
}

const OUT_DIR = path.join(process.cwd(), 'public/images/visual-profiler');
if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function generateImage(prompt: string, filename: string) {
    const filePath = path.join(OUT_DIR, filename);
    if (fs.existsSync(filePath)) {
        console.log(`Skipping ${filename}, already exists.`);
        return;
    }

    console.log(`Generating ${filename}...`);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                output_format: 'png',
                width: 1024,
                height: 1024
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`Failed to start generation for ${filename}: ${response.status} ${response.statusText}`, errText);
            return;
        }

        const initialData = await response.json();

        // Check if it's the async pattern
        if (initialData.data && initialData.data.status === 'created' && initialData.data.urls && initialData.data.urls.get) {
            const pollUrl = initialData.data.urls.get;
            console.log(`Job created for ${filename}, polling ${pollUrl}...`);

            let attempts = 0;
            while (attempts < 150) { // Timeout after ~300s (5 mins)
                await new Promise(resolve => setTimeout(resolve, 2000));

                const pollRes = await fetch(pollUrl, {
                    headers: { 'Authorization': `Bearer ${API_KEY}` }
                });

                if (!pollRes.ok) {
                    console.error(`Polling failed for ${filename}: ${pollRes.status}`);
                    // Don't break immediately, maybe transient?
                    if (attempts % 5 === 0) console.log(`Polling ${filename} attempt ${attempts}... status ${pollRes.status}`);
                } else {
                    const pollData = await pollRes.json();
                    const status = pollData.data ? pollData.data.status : pollData.status;

                    console.log(`Polling ${filename} attempt ${attempts}: ${status}`);

                    if (status === 'succeeded' || status === 'completed') {
                        let imageUrl = null;
                        if (pollData.data.outputs && pollData.data.outputs.length > 0) {
                            const output = pollData.data.outputs[0];
                            if (typeof output === 'string') {
                                imageUrl = output;
                            } else if (output.url) {
                                imageUrl = output.url;
                            }
                        } else if (pollData.data.url) {
                            imageUrl = pollData.data.url;
                        }

                        if (imageUrl) {
                            console.log(`Downloading image for ${filename} from ${imageUrl}`);
                            const imgRes = await fetch(imageUrl);
                            const buffer = await imgRes.arrayBuffer();
                            fs.writeFileSync(filePath, Buffer.from(buffer));
                            console.log(`Saved ${filename}`);
                            return;
                        } else {
                            console.error(`Success but no image URL found for ${filename}`, pollData);
                            return;
                        }
                    } else if (status === 'failed' || status === 'canceled') {
                        console.error(`Generation failed for ${filename}:`, pollData.data ? pollData.data.error : pollData.error);
                        return;
                    }
                }

                attempts++;
            }
            console.error(`Timed out waiting for ${filename}`);

        } else {
            // Fallback for synchronous or different format
            console.error('Unexpected response format:', JSON.stringify(initialData).substring(0, 200));
        }

    } catch (error) {
        console.error(`Error generating ${filename}:`, error);
    }
}

async function main() {
    const CONCURRENCY = 5;
    const queue: (() => Promise<void>)[] = [];

    for (const pair of PAIRS) {
        // Image A
        queue.push(async () => {
            const filenameA = path.basename(pair.imageA.src);
            // @ts-ignore
            const promptA = pair.imageA.prompt || pair.imageA.alt;
            await generateImage(promptA, filenameA);
        });

        // Image B
        queue.push(async () => {
            const filenameB = path.basename(pair.imageB.src);
            // @ts-ignore
            const promptB = pair.imageB.prompt || pair.imageB.alt;
            await generateImage(promptB, filenameB);
        });
    }

    // Process queue with concurrency limit
    const activePromises: Promise<void>[] = [];
    for (const task of queue) {
        if (activePromises.length >= CONCURRENCY) {
            await Promise.race(activePromises);
        }

        const p = task().then(() => {
            activePromises.splice(activePromises.indexOf(p), 1);
        });
        activePromises.push(p);
    }

    await Promise.all(activePromises);
    console.log('All images processed.');
}

main();
