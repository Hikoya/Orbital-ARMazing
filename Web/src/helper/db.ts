import { PrismaClient } from '@prisma/client';

/**
 * Prisma Database client that is shared by all functions for any database queries
 */
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
