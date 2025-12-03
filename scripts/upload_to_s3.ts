import { S3Client, PutObjectCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import dotenv from 'dotenv';

dotenv.config();

const BUCKET_NAME = 'justbblog';
const REGION = process.env.AWS_REGION || 'us-east-1';
const IMAGES_DIR = path.join(process.cwd(), 'public/images/visual-profiler');

const s3Client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
});

async function uploadFile(fileName: string) {
    const filePath = path.join(IMAGES_DIR, fileName);
    const fileContent = fs.readFileSync(filePath);
    const contentType = mime.lookup(filePath) || 'application/octet-stream';
    const key = `visual-profiler/${fileName}`;

    try {
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileContent,
            ContentType: contentType
            // ACL removed as it's not supported with 'Bucket owner enforced'
        }));
        console.log(`✅ Uploaded: ${fileName} -> s3://${BUCKET_NAME}/${key}`);
    } catch (err) {
        console.error(`❌ Failed to upload ${fileName}:`, err);
    }
}

async function setPublicPolicy() {
    try {
        const policy = {
            Version: "2012-10-17",
            Statement: [
                {
                    Sid: "PublicReadGetObject",
                    Effect: "Allow",
                    Principal: "*",
                    Action: "s3:GetObject",
                    Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
                }
            ]
        };

        const command = new PutBucketPolicyCommand({
            Bucket: BUCKET_NAME,
            Policy: JSON.stringify(policy)
        });

        await s3Client.send(command);
        console.log("✅ Bucket policy updated to allow public read access.");
    } catch (err) {
        console.error("❌ Failed to set bucket policy:", err);
    }
}

async function main() {
    // Set policy first
    await setPublicPolicy();

    if (!fs.existsSync(IMAGES_DIR)) {
        console.error(`Source directory not found: ${IMAGES_DIR}`);
        return;
    }

    const files = fs.readdirSync(IMAGES_DIR);
    console.log(`Found ${files.length} files in ${IMAGES_DIR}`);

    for (const file of files) {
        if (file.startsWith('.')) continue; // Skip .DS_Store etc

        const filePath = path.join(IMAGES_DIR, file);
        if (fs.statSync(filePath).isFile()) {
            await uploadFile(file);
        }
    }
    console.log('Migration complete!');
}

main().catch(console.error);
