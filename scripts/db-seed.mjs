import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { neon } from "@neondatabase/serverless";

import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const meetingsDir = path.join(root, "content", "koseki-monthly-meeting");

const SKIP_FILES = new Set(["_template.md", "README.md"]);
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;

const LEGACY_TO_NEW = {
  論点: "協議",
  資料リンク: "資料",
  "未解決・次回へ": "協議",
  "次回予定・宿題": "事務連絡",
  その他メモ: "その他",
};

const defaultContentHeadings = ["事務連絡", "協議", "研修", "その他"];

function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL
  );
}

function parseFrontmatter(raw) {
  const data = {};
  for (const line of raw.split(/\r?\n/).filter((item) => item.trim() !== "")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    data[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  return data;
}

function parseSections(body) {
  const sections = {};
  for (const heading of defaultContentHeadings) sections[heading] = "";
  sections["資料"] = "";

  for (const part of body.split(/^## /m).slice(1)) {
    const newline = part.indexOf("\n");
    if (newline === -1) continue;
    const heading = part.slice(0, newline).trim();
    const content = part.slice(newline + 1).trim();
    const target = LEGACY_TO_NEW[heading] ?? heading;
    sections[target] = sections[target]?.trim()
      ? `${sections[target]}\n\n${content}`
      : content;
  }

  return sections;
}

function parseMaterialLinks(content) {
  const links = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match = re.exec(content);
  while (match) {
    links.push({ label: match[1], href: match[2] });
    match = re.exec(content);
  }
  return links;
}

async function upsertMeeting(sql, slug, frontmatter, sections) {
  const existing = await sql`SELECT id FROM meetings WHERE slug = ${slug} LIMIT 1`;
  const now = new Date().toISOString();
  let meetingId = existing[0]?.id;

  if (meetingId) {
    await sql`
      UPDATE meetings
      SET held_on = ${frontmatter.heldOn},
          theme = ${frontmatter.theme},
          folder_slug = ${frontmatter.folderSlug},
          status = ${frontmatter.status},
          updated_at = ${now}
      WHERE id = ${meetingId}
    `;
    await sql`DELETE FROM meeting_sections WHERE meeting_id = ${meetingId}`;
    await sql`DELETE FROM meeting_materials WHERE meeting_id = ${meetingId}`;
  } else {
    const inserted = await sql`
      INSERT INTO meetings (slug, held_on, theme, folder_slug, status, created_at, updated_at)
      VALUES (
        ${slug},
        ${frontmatter.heldOn},
        ${frontmatter.theme},
        ${frontmatter.folderSlug},
        ${frontmatter.status},
        ${now},
        ${now}
      )
      RETURNING id
    `;
    meetingId = inserted[0].id;
  }

  for (const [index, sectionType] of defaultContentHeadings.entries()) {
    await sql`
      INSERT INTO meeting_sections (meeting_id, section_type, body, sort_order)
      VALUES (${meetingId}, ${sectionType}, ${sections[sectionType] ?? ""}, ${index})
    `;
  }

  const materials = parseMaterialLinks(sections["資料"] ?? "");
  for (const [index, item] of materials.entries()) {
    await sql`
      INSERT INTO meeting_materials (meeting_id, label, url, sort_order)
      VALUES (${meetingId}, ${item.label}, ${item.href}, ${index})
    `;
  }
}

async function removeOrphanMeetings(sql, fileSlugs) {
  const rows = await sql`SELECT slug FROM meetings`;
  const orphans = rows.filter((row) => !fileSlugs.includes(row.slug));

  for (const { slug } of orphans) {
    await sql`DELETE FROM meetings WHERE slug = ${slug}`;
    console.log(`  - removed from DB (no markdown file): ${slug}`);
  }
}

async function main() {
  const url = getDatabaseUrl();
  if (!url) {
    console.error("DATABASE_URL is not set. Add it to .env.local first.");
    process.exit(1);
  }

  const sql = neon(url);
  const files = readdirSync(meetingsDir).filter(
    (name) => name.endsWith(".md") && !SKIP_FILES.has(name)
  );

  console.log(`Seeding ${files.length} markdown file(s) into Neon...`);

  if (process.argv.includes("--prune")) {
    await removeOrphanMeetings(sql, files.map((name) => name.replace(/\.md$/, "")));
  } else {
    console.log("  (DB のみにある回次は削除しません。初回復旧時は npm run db:seed -- --prune)");
  }

  for (const filename of files) {
    const slug = filename.replace(/\.md$/, "");
    const raw = readFileSync(path.join(meetingsDir, filename), "utf8");
    const match = raw.match(FRONTMATTER_RE);
    if (!match) {
      console.warn(`Skip invalid file: ${filename}`);
      continue;
    }

    const frontmatter = parseFrontmatter(match[1]);
    const sections = parseSections(match[2]);
    await upsertMeeting(sql, slug, frontmatter, sections);
    console.log(`  ✓ ${slug}`);
  }

  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
