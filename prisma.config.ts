// prisma.config.ts
import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from your .env file!");
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    // This dynamically constructs the exact absolute path to your seed file
    seed: `npx ts-node ${path.join(__dirname, 'prisma', 'seed.ts')}`,
  },
});