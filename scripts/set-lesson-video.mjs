#!/usr/bin/env node
// Launcher so `node scripts/set-lesson-video.mjs <id> <url>` works.
// The real script is set-lesson-video.ts next to this file; it needs tsx because
// it imports from src/ and the repo's scripts are TypeScript. This just forwards.
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const target = join(here, 'set-lesson-video.ts');

const { status } = spawnSync('npx', ['tsx', target, ...process.argv.slice(2)], {
    stdio: 'inherit',
    cwd: join(here, '..'),
});

process.exit(status ?? 1);
