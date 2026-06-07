import { isDatabaseConfigured } from "@/lib/koseki/db/client";
import {
  loadMeetingFromDb,
  loadMeetingsFromDb,
  saveMeetingToDb,
} from "@/lib/koseki/db/meetings";
import {
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

export async function saveMeeting(record: MeetingRecord): Promise<void> {
  if (getKosekiDataSource() === "database") {
    await saveMeetingToDb(record);
    return;
  }
  await saveMeetingToFile(record);
}
