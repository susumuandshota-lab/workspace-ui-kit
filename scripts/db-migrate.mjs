import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { neon } from "@neondatabase/serverless";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL
  );
}

async function main() {
  const url = getDatabaseUrl();
  if (!url) {
    console.error("DATABASE_URL is not set. Add it to .env.local first.");
    process.exit(1);
  }

  const sqlPath = path.join(root, "drizzle", "0000_init.sql");
  const migration = readFileSync(sqlPath, "utf8");
  const sql = neon(url);

  console.log("Applying migration:", sqlPath);
  await sql.query(migration);
  console.log("Migration complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
