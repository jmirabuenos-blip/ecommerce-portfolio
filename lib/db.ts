// lib/db.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

if (!global.prisma) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing from your .env file!");
  }

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);

  global.prisma = new PrismaClient({ adapter });
}

export const prisma = global.prisma!;