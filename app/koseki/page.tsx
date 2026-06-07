import { KosekiWorkspace } from "@/components/koseki/KosekiWorkspace";
import { loadMeetings } from "@/lib/koseki/meetings";

export default async function KosekiArchivePage() {
  const meetings = await loadMeetings({ status: "published" });
  return <KosekiWorkspace meetings={meetings} />;
}
