import { z } from "zod";

export const meetingStatusSchema = z.enum(["draft", "published"]);

export const meetingFrontmatterSchema = z.object({
  status: meetingStatusSchema,
  heldOn: z.string().min(1),
  theme: z.string().min(1),
  folderSlug: z.string().min(1),
});

export type MeetingStatus = z.infer<typeof meetingStatusSchema>;
export type MeetingFrontmatter = z.infer<typeof meetingFrontmatterSchema>;

export const defaultContentHeadings = ["事務連絡", "協議", "研修", "その他"] as const;

export const materialsHeadingNames = ["資料", "資料リンク"] as const;

export type MeetingSections = Record<string, string>;

export type MeetingRecord = {
  slug: string;
  frontmatter: MeetingFrontmatter;
  sections: MeetingSections;
};

export function isMaterialsHeading(heading: string): boolean {
  return (materialsHeadingNames as readonly string[]).includes(heading);
}

export function getContentHeadings(sections: MeetingSections): string[] {
  const keys = Object.keys(sections).filter((k) => !isMaterialsHeading(k));
  const ordered: string[] = [];
  for (const h of defaultContentHeadings) {
    if (keys.includes(h)) ordered.push(h);
  }
  for (const k of keys.sort()) {
    if (!ordered.includes(k)) ordered.push(k);
  }
  return ordered;
}

export function getMaterialsContent(sections: MeetingSections): string {
  return materialsHeadingNames
    .map((name) => sections[name]?.trim())
    .filter((p) => p && p.length > 0)
    .join("\n\n");
}

export const meetingEditFormSchema = meetingFrontmatterSchema.extend({
  slug: z.string().min(1),
  contentSections: z.record(z.string(), z.string()),
  materials: z.string(),
});

export type MeetingEditFormInput = z.infer<typeof meetingEditFormSchema>;
