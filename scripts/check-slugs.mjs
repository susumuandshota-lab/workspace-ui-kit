import { neon } from "@neondatabase/serverless";

import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const url =
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL;

if (!url) {
  console.error("No DATABASE_URL");
  process.exit(1);
}

const sql = neon(url);
const rows = await sql`SELECT slug, status, theme FROM meetings ORDER BY held_on DESC`;
console.log(JSON.stringify(rows, null, 2));

for (const { slug } of rows) {
  const found = await sql`SELECT slug FROM meetings WHERE slug = ${slug} LIMIT 1`;
  console.log(`exact match ${slug}:`, found.length > 0);
}
