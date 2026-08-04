import 'server-only';
import { stackServerApp } from '@/lib/stack';

/** The single admin identity. Also enforced for page rendering in src/app/admin/layout.tsx. */
export const ADMIN_EMAIL = 'cogear@gmail.com';

/**
 * Server Actions are individually addressable POST endpoints — the layout's
 * check only guards page rendering, so every admin action must call this itself.
 */
export async function isAdmin(): Promise<boolean> {
    try {
        const user = await stackServerApp.getUser();
        return user?.primaryEmail === ADMIN_EMAIL;
    } catch {
        return false;
    }
}
