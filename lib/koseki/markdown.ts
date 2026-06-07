import {
  defaultContentHeadings,
  getContentHeadings,
  isMaterialsHeading,
  materialsHeadingNames,
  meetingFrontmatterSchema,
  type MeetingFrontmatter,
  type MeetingRecord,
  type MeetingSections,
} from "@/lib/koseki/schema";

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;

const LEGACY_TO_NEW: Record<string, string> = {
  論点: "協議",
  資料リンク: "資料",
  "未解決・次回へ": "協議",
  "次回予定・宿題": "事務連絡",
  その他メモ: "その他",
};

function parseFrontmatterYaml(raw: string): MeetingFrontmatter {
  const lines = raw.split(/\r?\n/).filter((line) => line.trim() !== "");
  const data: Record<string, string> = {};
  for (const line of lines) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    data[key] = value;
  }
  return meetingFrontmatterSchema.parse(data);
}

function serializeFrontmatterYaml(fm: MeetingFrontmatter): string {
  return ["status", "heldOn", "theme", "folderSlug"]
    .map((key) => `${key}: ${fm[key as keyof MeetingFrontmatter]}`)
    .join("\n");
}

function parseSections(body: string): MeetingSections {
  const sections: MeetingSections = {};
  for (const h of defaultContentHeadings) sections[h] = "";
  sections["資料"] = "";

  const parts = body.split(/^## /m).slice(1);
  for (const part of parts) {
    const newline = part.indexOf("\n");
    if (newline === -1) continue;
    const heading = part.slice(0, newline).trim();
    const content = part.slice(newline + 1).trim();
    const target = LEGACY_TO_NEW[heading] ?? heading;
    if (sections[target]?.trim()) {
      sections[target] = `${sections[target]}\n\n${content}`;
    } else {
      sections[target] = content;
    }
  }

  return sections;
}

function serializeSectionOrder(sections: MeetingSections): string[] {
  const content = getContentHeadings(sections);
  const materials = materialsHeadingNames.filter(
    (name) => (sections[name]?.trim() ?? "").length > 0
  );
  if (materials.length === 0) return [...content, "資料"];
  return [...content, ...materials];
}

export function parseMeetingMarkdown(slug: string, raw: string): MeetingRecord {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) throw new Error(`Invalid meeting markdown: ${slug}`);
  const frontmatter = parseFrontmatterYaml(match[1]);
  const sections = parseSections(match[2]);
  return { slug, frontmatter, sections };
}

export function serializeMeetingMarkdown(record: MeetingRecord): string {
  const fm = serializeFrontmatterYaml(record.frontmatter);
  const order = serializeSectionOrder(record.sections);
  const body = order
    .map((key) => `## ${key}\n\n${(record.sections[key] ?? "").trim()}`)
    .join("\n\n");
  return `---\n${fm}\n---\n\n# ${record.frontmatter.folderSlug}\n\n${body}\n`;
}

export function isSafeExternalUrl(href: string): boolean {
  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function findUnsafeMaterialLinks(content: string): string[] {
  const unsafe: string[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    if (!isSafeExternalUrl(m[2])) unsafe.push(m[2]);
  }
  return unsafe;
}

export function parseMaterialLinks(content: string): { label: string; href: string }[] {
  const links: { label: string; href: string }[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    if (isSafeExternalUrl(m[2])) {
      links.push({ label: m[1], href: m[2] });
    }
  }
  return links;
}

export function parseBulletLines(content: string): string[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*-\s*/, "").trim())
    .filter((line) => line.length > 0);
}

export { isMaterialsHeading };
