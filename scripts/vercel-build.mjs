import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

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

function run(command) {
  console.log(`> ${command}`);
  execSync(command, { cwd: root, stdio: "inherit" });
}

async function hasMeetingRows(url) {
  const sql = neon(url);
  const rows = await sql`SELECT id FROM meetings LIMIT 1`;
  return rows.length > 0;
}

async function main() {
  const url = getDatabaseUrl();

  if (url) {
    console.log("DATABASE_URL detected — preparing Neon for persistent storage...");
    run("node scripts/db-migrate.mjs");

    if (!(await hasMeetingRows(url))) {
      console.log("No meetings in database — seeding from markdown...");
      run("node scripts/db-seed.mjs");
    } else {
      console.log("Database already has meetings — skipping seed.");
    }
  } else {
    console.log(
      "No DATABASE_URL — building in file mode (read-only on Vercel; edits will not persist)."
    );
  }

  run("npm run build");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
