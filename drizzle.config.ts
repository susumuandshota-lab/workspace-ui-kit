import { defineConfig } from "drizzle-kit";

const url =
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL;

if (!url) {
  throw new Error("Set DATABASE_URL or DATABASE_URL_UNPOOLED before running drizzle-kit");
}

export default defineConfig({
  schema: "./lib/koseki/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
