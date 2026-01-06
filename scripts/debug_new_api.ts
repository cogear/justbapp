
import fetch from 'node-fetch';

async function testApi() {
    // Try yesterday's date (or a recent one known to exist)
    const dateKey = '2026-01-05';
    const baseUrl = 'https://thewelist.com/api/blogs';

    // Test 1: Default format (metadata + HTML?)
    console.log(`Testing GET ${baseUrl}/${dateKey}`);
    try {
        const res = await fetch(`${baseUrl}/${dateKey}`);
        console.log(`Status: ${res.status}`);
        const contentType = res.headers.get('content-type');
        console.log(`Content-Type: ${contentType}`);

        if (contentType?.includes('application/json')) {
            const data = await res.json();
            console.log('JSON keys:', Object.keys(data));
            if (data.html) {
                console.log('HTML length:', data.html.length);
                console.log('HTML snippet:', data.html.substring(0, 100));
            } else {
                console.log('No "html" field in JSON. Full body:', JSON.stringify(data, null, 2).substring(0, 500));
            }
        } else {
            const text = await res.text();
            console.log('Response text snippet:', text.substring(0, 200));
        }
    } catch (e) {
        console.error('Error fetching default:', e);
    }

    console.log('\n---------------------------------\n');

    // Test 2: explicit format=html
    console.log(`Testing GET ${baseUrl}/${dateKey}?format=html`);
    try {
        const res = await fetch(`${baseUrl}/${dateKey}?format=html`);
        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log('Response text length:', text.length);
        console.log('Response text snippet:', text.substring(0, 200));
    } catch (e) {
        console.error('Error fetching HTML format:', e);
    }
}

testApi();
