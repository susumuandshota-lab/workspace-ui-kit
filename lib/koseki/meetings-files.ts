import { promises as fs } from "node:fs";
import path from "node:path";

import { parseMeetingMarkdown, serializeMeetingMarkdown } from "@/lib/koseki/markdown";
import type { MeetingRecord, MeetingStatus } from "@/lib/koseki/schema";

export const MEETINGS_DIR = path.join(
  process.cwd(),
  "content",
  "koseki-monthly-meeting"
);

const SKIP_FILES = new Set(["_template.md", "README.md"]);

function isMeetingFile(name: string): boolean {
  return name.endsWith(".md") && !SKIP_FILES.has(name);
}

export function slugFromFilename(filename: string): string {
  return filename.replace(/\.md$/, "");
}

export async function listMeetingSlugs(): Promise<string[]> {
  const entries = await fs.readdir(MEETINGS_DIR);
  return entries.filter(isMeetingFile).map(slugFromFilename).sort().reverse();
}

export async function loadMeetingFromFile(slug: string): Promise<MeetingRecord> {
  const filePath = path.join(MEETINGS_DIR, `${slug}.md`);
  const raw = await fs.readFile(filePath, "utf8");
  return parseMeetingMarkdown(slug, raw);
}

export async function loadMeetingsFromFiles(
  options: { status?: MeetingStatus } = {}
): Promise<MeetingRecord[]> {
  const slugs = await listMeetingSlugs();
  const records = await Promise.all(slugs.map((slug) => loadMeetingFromFile(slug)));
  const filtered =
    options.status === undefined
      ? records
      : records.filter((r) => r.frontmatter.status === options.status);
  return filtered.sort((a, b) =>
    b.frontmatter.heldOn.localeCompare(a.frontmatter.heldOn)
  );
}

export async function saveMeetingToFile(record: MeetingRecord): Promise<void> {
  const filePath = path.join(MEETINGS_DIR, `${record.slug}.md`);
  const content = serializeMeetingMarkdown(record);
  await fs.writeFile(filePath, content, "utf8");
}
