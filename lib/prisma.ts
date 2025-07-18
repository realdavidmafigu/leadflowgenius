import { PrismaClient } from '../generated/prisma';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Test database connection
prisma.$connect()
  .then(() => {
    console.log('[PRISMA] Database connected successfully');
  })
  .catch((error) => {
    console.error('[PRISMA] Database connection failed:', error);
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 