import 'server-only';
import prisma from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';

/**
 * Resolve the current Stack-authenticated user to our DB User, creating one on
 * first sight. Returns null when no one is signed in.
 *
 * The DB `User.id` is the canonical opaque token handed to bounded contexts such
 * as Circles — they store it as plain text and never resolve it back to a person.
 */
export async function getOrCreateUser() {
  const stackUser = await stackServerApp.getUser();
  if (!stackUser) return null;

  let user = await prisma.user.findUnique({
    where: { email: stackUser.primaryEmail || '' },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { email: stackUser.primaryEmail || '' },
    });
  }

  return user;
}
