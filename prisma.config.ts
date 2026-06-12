import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
  // Keep generate usable even when DATABASE_URL is not set in some CI steps.
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
