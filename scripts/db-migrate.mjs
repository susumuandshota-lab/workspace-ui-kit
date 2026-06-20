import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { neon } from "@neondatabase/serverless";

import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL
  );
}

function splitSqlStatements(migration) {
  const statements = [];
  let current = "";
  let inDollarQuote = false;

  for (const line of migration.split(/\r?\n/)) {
    current += `${line}\n`;

    if (line.includes("$$")) {
      inDollarQuote = !inDollarQuote;
    }

    if (!inDollarQuote && line.trim().endsWith(";")) {
      const statement = current.trim();
      if (statement) statements.push(statement);
      current = "";
    }
  }

  const trailing = current.trim();
  if (trailing) statements.push(trailing);

  return statements;
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
  const statements = splitSqlStatements(migration);

  console.log("Applying migration:", sqlPath);
  for (const statement of statements) {
    await sql.query(statement);
  }
  console.log("Migration complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
