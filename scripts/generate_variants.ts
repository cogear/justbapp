import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { PAIRS } from '../src/lib/visual-profiler/data';

dotenv.config();

const API_KEY = process.env.WAVESPEED_API_KEY;
const API_URL = "https://api.wavespeed.ai/api/v3/bytedance/seedream-v4";

const OUTPUT_DIR = path.join(process.cwd(), 'public/images/visual-profiler');

async function downloadImage(url: string, filepath: string) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(buffer));
}

async function generateVariant(prompt: string, filename: string) {
    const filepath = path.join(OUTPUT_DIR, filename);
    if (fs.existsSync(filepath)) {
        console.log(`Skipping ${filename} (already exists)`);
        return;
    }

    if (!API_KEY) {
        console.error("Missing WAVESPEED_API_KEY");
        process.exit(1);
    }

    console.log(`Generating ${filename} with Seedream v4...`);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                prompt: prompt,
                size: "1024*1024", // Wavespeed often uses * separator
                output_format: "png"
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        let resultUrl = '';
        if (data.data?.urls?.get) {
            resultUrl = data.data.urls.get;
        } else {
            console.error("Unexpected API response structure:", JSON.stringify(data, null, 2));
            return;
        }

        // Poll for result
        let imageUrl = '';
        let attempts = 0;
        const maxAttempts = 150; // 150 * 2s = 300s (5 mins) timeout

        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s

            const pollResponse = await fetch(resultUrl, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`
                }
            });

            if (!pollResponse.ok) {
                console.error(`Polling failed: ${pollResponse.status}`);
                break;
            }

            const pollData = await pollResponse.json();
            // Check status. Assuming structure based on typical async APIs.
            // Usually: { data: { status: "succeeded", output: { url: "..." } } }
            // Or just { status: "succeeded", output: ... }

            const status = pollData.data?.status || pollData.status;

            if (attempts % 5 === 0) process.stdout.write(`[${status}]`);

            if (status === 'succeeded' || status === 'success' || status === 'completed') {
                console.log("Success response:", JSON.stringify(pollData, null, 2));
                // Extract URL
                if (Array.isArray(pollData.data?.outputs) && typeof pollData.data.outputs[0] === 'string') {
                    imageUrl = pollData.data.outputs[0];
                } else if (pollData.data?.outputs?.[0]?.url) {
                    imageUrl = pollData.data.outputs[0].url;
                } else if (pollData.data?.output?.url) {
                    imageUrl = pollData.data.output.url;
                } else if (pollData.output?.url) {
                    imageUrl = pollData.output.url;
                } else if (pollData.data?.url) {
                    imageUrl = pollData.data.url;
                }
                break;
            } else if (status === 'failed') {
                console.error(`Generation failed: ${JSON.stringify(pollData)}`);
                break;
            }

            attempts++;
            process.stdout.write('.');
        }
        console.log(''); // Newline

        if (imageUrl) {
            await downloadImage(imageUrl, filepath);
            console.log(`Saved ${filename}`);
        } else {
            console.error(`Failed to get image URL for ${filename} after polling.`);
        }
    } catch (error) {
        console.error(`Error generating ${filename}:`, error);
    }
}

async function main() {
    // Filter for Layers 2 and 3
    const targetPairs = PAIRS.filter(p => p.layer === 2 || p.layer === 3);
    console.log(`Found ${targetPairs.length} pairs in Layers 2 and 3.`);

    for (const pair of targetPairs) {
        // Image A Variants
        if (pair.imageA.prompt && pair.imageA.src) {
            const filenameA = pair.imageA.src.split('/').pop() || '';
            if (filenameA) {
                const nameA = filenameA.replace('.png', '');
                await generateVariant(pair.imageA.prompt, `${nameA}_v2.png`);
                await generateVariant(pair.imageA.prompt, `${nameA}_v3.png`);
            }
        }

        // Image B Variants
        if (pair.imageB.prompt && pair.imageB.src) {
            const filenameB = pair.imageB.src.split('/').pop() || '';
            if (filenameB) {
                const nameB = filenameB.replace('.png', '');
                await generateVariant(pair.imageB.prompt, `${nameB}_v2.png`);
                await generateVariant(pair.imageB.prompt, `${nameB}_v3.png`);
            }
        }
    }
}

main().catch(console.error);
