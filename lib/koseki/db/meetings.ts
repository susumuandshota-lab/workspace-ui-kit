import { asc, desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/koseki/db/client";
import {
  meetingMaterials,
  meetingSections,
  meetings,
} from "@/lib/koseki/db/schema";
import { parseMaterialLinks, serializeMeetingMarkdown } from "@/lib/koseki/markdown";
import {
  defaultContentHeadings,
  type MeetingRecord,
  type MeetingSections,
  type MeetingStatus,
} from "@/lib/koseki/schema";

function recordToSections(record: MeetingRecord): {
  content: { sectionType: string; body: string; sortOrder: number }[];
  materials: { label: string; url: string; sortOrder: number }[];
} {
  const content = defaultContentHeadings.map((sectionType, index) => ({
    sectionType,
    body: (record.sections[sectionType] ?? "").trim(),
    sortOrder: index,
  }));

  const materialsContent = record.sections["資料"] ?? "";
  const materials = parseMaterialLinks(materialsContent).map((link, index) => ({
    label: link.label,
    url: link.href,
    sortOrder: index,
  }));

  return { content, materials };
}

function rowsToRecord(
  slug: string,
  meeting: typeof meetings.$inferSelect,
  sections: (typeof meetingSections.$inferSelect)[],
  materials: (typeof meetingMaterials.$inferSelect)[]
): MeetingRecord {
  const sectionMap: MeetingSections = {};
  for (const section of sections) {
    sectionMap[section.sectionType] = section.body;
  }

  for (const heading of defaultContentHeadings) {
    if (!(heading in sectionMap)) sectionMap[heading] = "";
  }

  const materialLines = materials
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => `- [${item.label}](${item.url})`);
  sectionMap["資料"] = materialLines.join("\n");

  return {
    slug,
    frontmatter: {
      status: meeting.status as MeetingStatus,
      heldOn: meeting.heldOn,
      theme: meeting.theme,
      folderSlug: meeting.folderSlug,
    },
    sections: sectionMap,
  };
}

export async function loadMeetingFromDb(slug: string): Promise<MeetingRecord> {
  const db = getDb();
  const [meeting] = await db.select().from(meetings).where(eq(meetings.slug, slug)).limit(1);
  if (!meeting) throw new Error(`Meeting not found: ${slug}`);

  const sections = await db
    .select()
    .from(meetingSections)
    .where(eq(meetingSections.meetingId, meeting.id))
    .orderBy(asc(meetingSections.sortOrder));

  const materials = await db
    .select()
    .from(meetingMaterials)
    .where(eq(meetingMaterials.meetingId, meeting.id))
    .orderBy(asc(meetingMaterials.sortOrder));

  return rowsToRecord(slug, meeting, sections, materials);
}

export async function loadMeetingsFromDb(
  options: { status?: MeetingStatus } = {}
): Promise<MeetingRecord[]> {
  const db = getDb();
  const rows =
    options.status === undefined
      ? await db.select().from(meetings).orderBy(desc(meetings.heldOn))
      : await db
          .select()
          .from(meetings)
          .where(eq(meetings.status, options.status))
          .orderBy(desc(meetings.heldOn));

  return Promise.all(rows.map((row) => loadMeetingFromDb(row.slug)));
}

export async function saveMeetingToDb(record: MeetingRecord): Promise<void> {
  const db = getDb();
  const { content, materials } = recordToSections(record);
  const now = new Date();

  const [existing] = await db
    .select()
    .from(meetings)
    .where(eq(meetings.slug, record.slug))
    .limit(1);

  let meetingId = existing?.id;

  if (existing) {
    await db
      .update(meetings)
      .set({
        heldOn: record.frontmatter.heldOn,
        theme: record.frontmatter.theme,
        folderSlug: record.frontmatter.folderSlug,
        status: record.frontmatter.status,
        updatedAt: now,
      })
      .where(eq(meetings.id, existing.id));
  } else {
    const [created] = await db
      .insert(meetings)
      .values({
        slug: record.slug,
        heldOn: record.frontmatter.heldOn,
        theme: record.frontmatter.theme,
        folderSlug: record.frontmatter.folderSlug,
        status: record.frontmatter.status,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: meetings.id });
    meetingId = created.id;
  }

  if (!meetingId) throw new Error(`Failed to save meeting: ${record.slug}`);

  await db.delete(meetingSections).where(eq(meetingSections.meetingId, meetingId));
  await db.delete(meetingMaterials).where(eq(meetingMaterials.meetingId, meetingId));

  if (content.length > 0) {
    await db.insert(meetingSections).values(
      content.map((section) => ({
        meetingId,
        sectionType: section.sectionType,
        body: section.body,
        sortOrder: section.sortOrder,
      }))
    );
  }

  if (materials.length > 0) {
    await db.insert(meetingMaterials).values(
      materials.map((item) => ({
        meetingId,
        label: item.label,
        url: item.url,
        sortOrder: item.sortOrder,
      }))
    );
  }
}

/** Markdown から DB へ取り込む際の補助（ファイル内容をそのまま保存したい場合） */
export function meetingRecordToMarkdown(record: MeetingRecord): string {
  return serializeMeetingMarkdown(record);
}
