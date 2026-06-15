import dotenv from 'dotenv';

// Mirror Next.js env precedence: .env.local wins, .env is the fallback.
// dotenv does not override already-set vars, so loading local first is enough.
dotenv.config({ path: '.env.local' });
dotenv.config();
