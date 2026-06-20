import { isDatabaseConfigured } from "@/lib/koseki/db/client";
import {
  loadMeetingFromDb,
  loadMeetingsFromDb,
  saveMeetingToDb,
} from "@/lib/koseki/db/meetings";
import {
  exportMeetingsToFiles,
  loadMeetingFromFile,
  loadMeetingsFromFiles,
  saveMeetingToFile,
} from "@/lib/koseki/meetings-files";
import type { MeetingRecord, MeetingStatus } from "@/lib/koseki/schema";

export { MEETINGS_DIR, listMeetingSlugs, slugFromFilename } from "@/lib/koseki/meetings-files";

export type KosekiDataSource = "database" | "file";

export function getKosekiDataSource(): KosekiDataSource {
  const configured = process.env.KOSEKI_DATA_SOURCE?.trim().toLowerCase();
  if (configured === "file") return "file";
  if (configured === "database") return "database";
  return isDatabaseConfigured() ? "database" : "file";
}

export async function loadMeeting(slug: string): Promise<MeetingRecord> {
  if (getKosekiDataSource() === "database") {
    return loadMeetingFromDb(slug);
  }
  return loadMeetingFromFile(slug);
}

export async function loadMeetings(
  options: { status?: MeetingStatus } = {}
): Promise<MeetingRecord[]> {
  if (getKosekiDataSource() === "database") {
    return loadMeetingsFromDb(options);
  }
  return loadMeetingsFromFiles(options);
}

export type SaveMeetingResult = {
  mirroredToFile: boolean;
};

export async function mirrorMeetingToFile(record: MeetingRecord): Promise<boolean> {
  try {
    await saveMeetingToFile(record);
    return true;
  } catch {
    return false;
  }
}

export async function saveMeeting(record: MeetingRecord): Promise<SaveMeetingResult> {
  if (getKosekiDataSource() === "database") {
    await saveMeetingToDb(record);
    const mirroredToFile = await mirrorMeetingToFile(record);
    return { mirroredToFile };
  }
  await saveMeetingToFile(record);
  return { mirroredToFile: true };
}

/** Neon の内容を Git 用 Markdown に一括書き出し（運営コア向け） */
export async function exportMeetingsFromDatabase(): Promise<number> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured");
  }

  const records = await loadMeetingsFromDb();
  await exportMeetingsToFiles(records);
  return records.length;
}
